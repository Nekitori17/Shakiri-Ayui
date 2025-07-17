import fs from "fs";
import path from "path";
import { AttachmentBuilder, WebhookClient, MessageFlags } from "discord.js";
import { CustomError } from "./CustomError";
import CommonEmbedBuilder from "../embeds/commonEmbedBuilder";
import { AnyInteraction } from "../../types/AnyInteraction";

const logFolderPath = path.join(__dirname, "../../../logs");

/**
 * Ensures that the log folder exists.
 */
function createLogFolder() {
  if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath, { recursive: true });
  }
}

/**
 * Recursively converts an unknown error object into a string representation.
 * Handles circular references and ensures all properties are stringified.
 * @param error The unknown error object
 * @returns A JSON string representation of the error
 */
function stringifyError(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const entries: Record<string, unknown> = {};
  const keys = Object.getOwnPropertyNames(error);

  for (const key of keys) {
    const value = (error as Record<string, unknown>)[key];
    entries[key] = value instanceof Object ? stringifyError(value) : value;
  }

  return JSON.stringify(entries, null, 2);
}

/**
 * Creates the error log content and file name.
 * @param error The Error object
 * @returns Object containing filename and logContentBuffer
 */
function createErrorLogFile(error: Error) {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const logContent = [
    `# Error Name: ${error.name}`,
    `# Error Message: ${error.message}`,
    `# Time: ${timestamp}`,
    `# Stack Trace: ${error.stack || "N/A"}`,
    "========================",
    stringifyError(error),
  ].join("\n");

  const logContentBuffer = Buffer.from(logContent);
  const filename = `Error-${timestamp}_${(
    process.hrtime.bigint() / 1_000_000n
  ).toString()}.log`;

  return { filename, logContentBuffer };
}

/**
 * Writes the error log to a `.log` file in the logs directory.
 * @param error The Error object
 */
function writeErrorLogToFile(error: Error) {
  createLogFolder();
  const { filename, logContentBuffer } = createErrorLogFile(error);
  fs.writeFileSync(path.join(logFolderPath, filename), logContentBuffer, {
    encoding: "utf-8",
  });
}

/**
 * Builds a Discord file attachment from an error.
 * @param error The Error object
 * @returns A Discord.js AttachmentBuilder instance
 */
function buildErrorAttachment(error: Error): AttachmentBuilder {
  const { filename, logContentBuffer } = createErrorLogFile(error);
  return new AttachmentBuilder(logContentBuffer, { name: filename });
}

/**
 * Sends the error to a Discord webhook (if environment variable is set).
 * @param error The Error object
 */
function sendToWebhook(error: Error) {
  const WEBHOOK_LOG_URL = process.env.WEBHOOK_LOG_ERROR_URL;
  if (!WEBHOOK_LOG_URL) return;

  const webhookClient = new WebhookClient({ url: WEBHOOK_LOG_URL });
  const errorLogAttachment = buildErrorAttachment(error);

  webhookClient.send({
    embeds: [
      CommonEmbedBuilder.error({
        title: "Error Log",
        description:
          `An error occurred at <t:${Math.floor(Date.now() / 1000)}:F>` +
          "\n\n" +
          `**Error Name**: ${error.name}` +
          `\n` +
          `**Error Message**: ${error.message}`,
      }),
    ],
    files: [errorLogAttachment],
  });
}

/**
 * Handles a raw error: logs to file and optionally sends to webhook.
 * @param error Error or unknown object
 * @param sendWebhook Whether to send to Discord webhook (default: true)
 */
export async function errorLogger(
  error: Error | unknown,
  sendWebhook = true
) {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    writeErrorLogToFile(err);

    if (sendWebhook) {
      sendToWebhook(err);
    }
  } catch (err) {
    console.error("\x1b[31m|> Error while logging error\x1b[0m");
    console.error("\x1b[32m", err, "\x1b[0m");
  }
}

/**
 * Checks if an interaction is still valid (not expired and not already responded to)
 * @param interaction The Discord interaction
 * @returns boolean indicating if the interaction is still valid
 */
function isInteractionValid(interaction: AnyInteraction): boolean {
  // Check if interaction is expired (Discord interactions expire after 15 minutes)
  const createdAt = interaction.createdTimestamp;
  const now = Date.now();
  const INTERACTION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  
  if (now - createdAt > INTERACTION_TIMEOUT) {
    return false;
  }
  
  return true;
}

/**
 * Safely defers an interaction reply with proper error handling
 * @param interaction The Discord interaction
 * @param ephemeral Whether the message should be ephemeral
 * @returns Promise<boolean> indicating if the defer was successful
 */
async function safelyDeferReply(
  interaction: AnyInteraction,
  ephemeral?: boolean
): Promise<boolean> {
  try {
    // Check if interaction is still valid
    if (!isInteractionValid(interaction)) {
      console.warn("Interaction is expired, cannot defer reply");
      return false;
    }

    // Check if already replied or deferred
    if (interaction.replied || interaction.deferred) {
      return true; // Already handled
    }

    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
    
    return true;
  } catch (error) {
    console.error("Failed to defer reply:", error);
    return false;
  }
}

/**
 * Safely sends a response to an interaction with proper error handling
 * @param interaction The Discord interaction
 * @param payload The message payload
 * @param newReply Whether to send a new reply or edit the existing one
 * @returns Promise<boolean> indicating if the response was successful
 */
async function safelySendResponse(
  interaction: AnyInteraction,
  payload: any,
  newReply?: boolean
): Promise<boolean> {
  try {
    if (!isInteractionValid(interaction)) {
      console.warn("Interaction is expired, cannot send response");
      return false;
    }

    if (newReply) {
      if (!interaction.replied) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    } else {
      if (interaction.deferred) {
        await interaction.editReply(payload);
      } else if (!interaction.replied) {
        await interaction.reply(payload);
      } else {
        await interaction.followUp(payload);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Failed to send response:", error);
    return false;
  }
}

/**
 * Handles and responds to an interaction with an error message.
 * Defer reply if needed, create an embed, attach error log, and respond to user.
 * @param interaction The Discord interaction
 * @param error Error, CustomError, or unknown
 * @param ephemeral Whether the message should be ephemeral (optional)
 * @param newReply Whether to send a new reply or edit the existing one (optional)
 */
export async function handleInteractionError(
  interaction: AnyInteraction,
  error: Error | CustomError | unknown,
  ephemeral?: boolean,
  newReply?: boolean
) {
  try {
    // Check if interaction is still valid
    if (!isInteractionValid(interaction)) {
      console.warn("Interaction is expired, logging error only");
      if (error instanceof Error) {
        errorLogger(error);
      }
      return;
    }

    // Safely defer reply if not already handled
    const deferSuccess = await safelyDeferReply(interaction, ephemeral);
    if (!deferSuccess && !interaction.replied && !interaction.deferred) {
      console.warn("Failed to defer reply and interaction is not handled");
      if (error instanceof Error) {
        errorLogger(error);
      }
      return;
    }

    const attachments: AttachmentBuilder[] = [];

    if (error instanceof Error) {
      errorLogger(error);
      attachments.push(buildErrorAttachment(error));
    }

    const {
      name = "Unknown Error",
      message = "No details provided",
      type = "error",
    } = error as CustomError;

    const embed = {
      warning: CommonEmbedBuilder.warning,
      info: CommonEmbedBuilder.info,
      error: CommonEmbedBuilder.error,
    }[type]({
      title: name,
      description: message,
    });

    const payload = {
      embeds: [embed],
      files: attachments,
      ephemeral,
    };

    // Safely send response
    const responseSuccess = await safelySendResponse(interaction, payload, newReply);
    if (!responseSuccess) {
      console.warn("Failed to send error response to user");
    }
  } catch (err) {
    console.error("Error in handleInteractionError:", err);
    errorLogger(err);
  }
}