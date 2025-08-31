import fs from "fs";
import path from "path";
import { AttachmentBuilder, WebhookClient, MessageFlags } from "discord.js";
import { CustomError } from "./CustomError";
import CommonEmbedBuilder from "../embeds/commonEmbedBuilder";
import { AnyInteraction } from "../../types/AnyInteraction";

// Path to the logs folder
const logFolderPath = path.join(__dirname, "../../../logs");

/**
 * Ensures the logs folder exists.
 */
function ensureLogFolder() {
  fs.mkdirSync(logFolderPath, { recursive: true });
}

/**
 * Recursively stringifies an unknown error object.
 * Handles nested values and avoids non-object types.
 */
function stringifyError(error: unknown): string {
  if (typeof error !== "object" || error === null) return String(error);

  const result: Record<string, unknown> = {};
  for (const key of Object.getOwnPropertyNames(error)) {
    const value = (error as Record<string, unknown>)[key];
    result[key] = typeof value === "object" ? stringifyError(value) : value;
  }

  return JSON.stringify(result, null, 2);
}

/**
 * Creates a formatted error log file from an Error instance.
 * @param error The error to log
 * @returns The filename and log content buffer
 */
function createErrorLog(error: Error) {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const filename = `Error-${timestamp}_${
    process.hrtime.bigint() / 1_000_000n
  }.log`;

  const content = [
    `# Error Name: ${error.name}`,
    `# Error Message: ${error.message}`,
    `# Time: ${timestamp}`,
    `# Stack Trace: ${error.stack || "N/A"}`,
    "========================",
    stringifyError(error),
  ].join("\n");

  return { filename, buffer: Buffer.from(content) };
}

/**
 * Writes the error log to a local file.
 */
function writeLogToFile(error: Error) {
  ensureLogFolder();
  const { filename, buffer } = createErrorLog(error);
  fs.writeFileSync(path.join(logFolderPath, filename), buffer, "utf-8");
}

/**
 * Builds a Discord attachment file from the error log.
 */
function buildErrorAttachment(error: Error) {
  const { filename, buffer } = createErrorLog(error);
  return new AttachmentBuilder(buffer, { name: filename });
}

/**
 * Sends the error report to a Discord webhook (if URL is set in env).
 */
function sendToWebhook(error: Error) {
  const url = process.env.WEBHOOK_LOG_ERROR_URL;
  if (!url) return;

  const webhook = new WebhookClient({ url });
  const attachment = buildErrorAttachment(error);

  webhook.send({
    embeds: [
      CommonEmbedBuilder.error({
        title: "Error Log",
        description:
          `An error occurred at <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `**Error Name**: ${error.name}\n**Error Message**: ${error.message}`,
      }),
    ],
    files: [attachment],
  });
}

/**
 * Main logger function to handle and optionally report an error.
 * @param error The error object or unknown value
 * @param sendWebhook Whether to also send to Discord webhook
 */
export async function errorLogger(error: unknown, sendWebhook = true) {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    writeLogToFile(err);
    if (sendWebhook) sendToWebhook(err);
  } catch (e) {
    console.error(
      "\x1b[31m|> Error while logging error\x1b[0m",
      "\n\x1b[32m",
      e,
      "\x1b[0m"
    );
  }
}

/**
 * Checks if a Discord interaction is still valid (not expired).
 */
function isInteractionValid(interaction: AnyInteraction): boolean {
  return Date.now() - interaction.createdTimestamp < 15 * 60 * 1000;
}

/**
 * Safely defers a Discord interaction reply if it hasn't been deferred or replied to yet.
 * The reply will be ephemeral.
 * @param interaction The interaction to defer.
 */
async function safetyDeferReply(interaction: AnyInteraction) {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });
  }
}

/**
 * Handles an error occurring in a Discord interaction.
 * Logs the error, builds an embed, and sends a reply to the user.
 */
export async function handleInteractionError(
  interaction: AnyInteraction,
  error: unknown,
  ephemeral?: boolean,
  newReply?: boolean
) {
  try {
    if (!isInteractionValid(interaction)) {
      if (error instanceof Error) errorLogger(error);
      return;
    }

    await safetyDeferReply(interaction);

    const attachments =
      error instanceof Error ? [buildErrorAttachment(error)] : [];
    if (error instanceof Error) errorLogger(error);

    const {
      name = "Unknown Error",
      message = "No details provided",
      type = "error",
    } = error as CustomError;

    const embed =
      {
        warning: CommonEmbedBuilder.warning,
        info: CommonEmbedBuilder.info,
        error: CommonEmbedBuilder.error,
      }[type] || CommonEmbedBuilder.error;

    const replyPayload = {
      embeds: [embed({ title: name, description: message })],
      files: attachments,
    };

    if (newReply) {
      await interaction.followUp({
        ...replyPayload,
        flags: ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    } else {
      await interaction.editReply(replyPayload);
    }
  } catch (err) {
    errorLogger(err);
  }
}
