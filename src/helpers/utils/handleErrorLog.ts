import fs from "fs";
import path from "path";
import { AttachmentBuilder, WebhookClient } from "discord.js";
import CommonEmbedBuilder from "../embeds/commonEmbedBuilder";

const logFolderPath = path.join(__dirname, "../../../logs");

/**
 * Ensures that the log folder exists. If it doesn't, it creates the folder recursively.
 */
function createLogFolder() {
  if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath, { recursive: true });
  }
}

/**
 * Recursively converts an unknown error object into a string representation.
 * Handles circular references and ensures all properties are stringified.
 * @param error The unknown error object to stringify.
 * @returns A JSON string representation of the error.
 */
function stringifyError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const entries: Record<string, unknown> = {};
  const keys = Object.getOwnPropertyNames(error); // Get all enumerable and non-enumerable own properties

  for (const key of keys) {
    const value = (error as Record<string, unknown>)[key];
    entries[key] = value instanceof Object ? stringifyError(value) : value; // Recursively stringify nested objects
  }

  return JSON.stringify(entries, null, 2);
}

/**
 * Creates an object containing the filename and content buffer for an error log file.
 * @param error The Error object to create the log file from.
 * @returns An object with `filename` (string) and `logContentBuffer` (Buffer).
 */
function createErrorLogFile(error: Error) {
  const timestamp = new Date().toISOString().replace(/:/g, "-");;
  const logContent = [
    `# Error Name: ${error.name}`,
    `# Error Message: ${error.message}`,
    `# Time: ${timestamp}`,
    `# Error at: ${error.stack || "N/A"}`,
    "========================",
    stringifyError(error),
  ].join("\n");

  // Convert the log content string to a Buffer
  const logContentBuffer = Buffer.from(logContent);

  // Generate a unique filename for the log, including a timestamp and a high-resolution time component
  const filename = `Error-${timestamp}_${(
    process.hrtime.bigint() / 1_000_000n
  ).toString()}.log`;

  return { filename, logContentBuffer };
}

function writeErrorLogToFile(error: Error) {
  // Ensure the log folder exists before writing the file
  createLogFolder();

  // Create the error log file content and filename
  const { filename, logContentBuffer } = createErrorLogFile(error);

  // Write the log content buffer to a file in the log folder
  fs.writeFileSync(path.join(logFolderPath, filename), logContentBuffer, {
    encoding: "utf-8",
  });
}

function createErrorLogAttachment(error: Error) {
  // Create the error log file content and filename
  const { filename, logContentBuffer } = createErrorLogFile(error);

  return new AttachmentBuilder(logContentBuffer, { name: filename });
}

/**
 * /**
 * Sends an error log to a configured Discord webhook.
 * This function retrieves the webhook URL from environment variables,
 * creates an attachment with the error details, and sends it via the webhook.
 * @param error The Error object to be sent to the webhook.
 */
function sendToWebhook(error: Error) {
  // Retrieve the webhook URL from environment variables.
  const WEBHOOK_LOG_URL = process.env.WEBHOOK_LOG_ERROR_URL as
    | string
    | undefined;
  // If no webhook URL is configured, exit the function.
  if (!WEBHOOK_LOG_URL) return;

  // Initialize a new WebhookClient with the provided URL.
  const webhookClient = new WebhookClient({
    url: WEBHOOK_LOG_URL,
  });

  // Create an attachment containing the detailed error log.
  const errorLogAttachment = createErrorLogAttachment(error);

  // Send the error information to the webhook.
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

export default async function (
  error: Error | unknown,
  sendWebhook: boolean = true
) {
  try {
    // Write the error details to a local log file.
    writeErrorLogToFile(
      error instanceof Error ? error : new Error(String(error))
    );

    // If sendWebhook flag is true, send the error details to the configured webhook.
    if (sendWebhook) {
      sendToWebhook(error instanceof Error ? error : new Error(String(error)));
    }
  } catch (error) {
    console.log(`\x1b[31m\x1b[1m|> Error while logging error\x1b[0m`);
    console.log(`\x1b[32m${error}\x1b[0m`);
  }
}
