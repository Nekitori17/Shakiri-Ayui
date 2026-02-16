import path from "path";
import fs from "fs/promises";
import { AttachmentBuilder, WebhookClient, MessageFlags } from "discord.js";
import { CustomError } from "./CustomError";
import { FnUtils } from "../common/FnUtils";
import CommonEmbedBuilder from "../discord/embeds/commonEmbedBuilder";
import { AnyInteraction } from "../../types/AnyInteraction";

const webhookUrl = process.env.WEBHOOK_LOG_ERROR_URL;
const webhookClient = webhookUrl
  ? new WebhookClient({ url: webhookUrl })
  : null;

const logFolderPath = path.join(__dirname, "../../../logs");

interface ErrorLogPayload {
  filename: string;
  content: string;
  buffer: Buffer;
}

async function ensureLogFolder() {
  try {
    await fs.access(logFolderPath);
  } catch {
    await fs.mkdir(logFolderPath, { recursive: true });
  }
}

function getCircularReplacer() {
  const seen = new WeakSet();
  return (_key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };
}

function stringifyError(error: unknown): string {
  return JSON.stringify(error, getCircularReplacer(), 2);
}

function createErrorLog(error: Error): ErrorLogPayload {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const filename = `Error-${FnUtils.generateUniqueTimestamp()}.log`;

  const content = [
    `# Error Name: ${error.name}`,
    `# Error Message: ${error.message}`,
    `# Time: ${timestamp}`,
    `# Stack Trace: ${error.stack || "N/A"}`,
    "========================",
    stringifyError(error),
  ].join("\n");

  return {
    filename,
    content,
    buffer: Buffer.from(content),
  };
}

async function writeLogToFile(log: ErrorLogPayload) {
  try {
    await ensureLogFolder();
    await fs.writeFile(
      path.join(logFolderPath, log.filename),
      log.content,
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to write log file:", err);
  }
}

function buildErrorAttachment(log: ErrorLogPayload) {
  return new AttachmentBuilder(log.buffer, { name: log.filename });
}

async function sendToWebhook(log: ErrorLogPayload, error: Error) {
  if (!webhookClient) return;

  try {
    await webhookClient.send({
      embeds: [
        CommonEmbedBuilder.error({
          title: "Error Log",
          description:
            `An error occurred at <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
            `**Error Name**: ${error.name}\n` +
            `**Error Message**: ${error.message}`,
        }),
      ],
      files: [buildErrorAttachment(log)],
    });
  } catch (err) {
    console.error("Failed to send webhook:", err);
  }
}

export async function errorLogger(error: unknown, sendWebhook = true) {
  try {
    const err =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "object" && error !== null
              ? JSON.stringify(error, getCircularReplacer(), 2)
              : String(error),
          );

    if (err instanceof CustomError) return;

    const log = createErrorLog(err);

    const tasks: Promise<unknown>[] = [writeLogToFile(log)];
    if (sendWebhook) tasks.push(sendToWebhook(log, err));

    await Promise.allSettled(tasks);
  } catch (e) {
    console.error("Error while logging error:", e);
  }
}

function isInteractionValid(interaction: AnyInteraction): boolean {
  return Date.now() - interaction.createdTimestamp < 15 * 60 * 1000;
}

async function safetyDeferReply(interaction: AnyInteraction) {
  if (interaction.isAutocomplete()) return;

  if (!interaction.deferred && !interaction.replied) {
    try {
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });
    } catch {
      // Interaction likely expired
    }
  }
}

export async function handleInteractionError(
  interaction: AnyInteraction,
  error: unknown,
  ephemeral?: boolean,
  newReply?: boolean,
) {
  if (interaction.isAutocomplete()) {
    await errorLogger(error);
    return;
  }

  try {
    if (!isInteractionValid(interaction)) {
      await errorLogger(error);
      return;
    }

    await safetyDeferReply(interaction);

    const err =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "object" && error !== null
              ? JSON.stringify(error, getCircularReplacer(), 2)
              : String(error),
          );
    const isCustom = err instanceof CustomError;

    const name = err.name || "Unknown Error";
    const message = err.message || "No details provided";
    const type = (err as Partial<CustomError>).type || "error";

    // Only log non-custom errors (custom errors are intentional user-facing messages)
    if (!isCustom) {
      await errorLogger(err);
    }

    const embedBuilder =
      {
        warning: CommonEmbedBuilder.warning,
        info: CommonEmbedBuilder.info,
        error: CommonEmbedBuilder.error,
      }[type] || CommonEmbedBuilder.error;

    const replyPayload = {
      embeds: [embedBuilder({ title: name, description: message })],
      files: isCustom ? [] : [buildErrorAttachment(createErrorLog(err))],
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
    await errorLogger(err);
  }
}