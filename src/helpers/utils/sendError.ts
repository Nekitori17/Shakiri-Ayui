import { AttachmentBuilder, MessageFlags } from "discord.js";
import { CustomError } from "./CustomError";
import CommonEmbedBuilder from "../embeds/commonEmbedBuilder";
import { AnyInteraction } from "../../types/AnyInteraction";

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
 * Builds an AttachmentBuilder containing detailed error information.
 * This attachment can be sent along with an error message for debugging.
 * @param error The Error object to build the attachment from.
 */
function buildErrorAttachment(error: Error) {
  const timestamp = new Date().toISOString();
  const logContent = [
    `# Error Name: ${error.name}`,
    `# Error Message: ${error.message}`,
    `# Time: ${timestamp}`,
    `# Error at: ${error.stack || "N/A"}`,
    "========================",
    stringifyError(error),
  ].join("\n");

  // Generate a unique filename for the log, including a timestamp and a high-resolution time component
  const filename = `Error-${timestamp}_${(
    process.hrtime.bigint() / 1_000_000n
  ).toString()}.log`;

  return new AttachmentBuilder(Buffer.from(logContent), { name: filename });
}

/**
 * Handles and responds to an interaction with an error message.
 * It defers the reply if not already replied/deferred, builds an error embed,
 * and optionally attaches a detailed error log file.
 * @param interaction The Discord interaction that caused the error.
 * @param error The error object (can be Error, CustomError, or unknown).
 * @param ephemeral Whether the error message should be ephemeral (only visible to the user). Defaults to false.
 * @param newReply Whether to send a new reply or edit the existing one. Defaults to false (edits existing).
 * @returns A Promise that resolves once the error message has been sent.
 */

export default async function handleError(
  interaction: AnyInteraction,
  error: Error | CustomError | unknown,
  ephemeral = false,
  newReply = false
) {
  // Defer the reply if not already replied or deferred
  if (!interaction.replied && !interaction.deferred) {
    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
  }

  const attachments: AttachmentBuilder[] = [];
  // If the error is an instance of Error, build an attachment with its details
  if (error instanceof Error) {
    attachments.push(buildErrorAttachment(error));
  }

  // Extract error details, defaulting to generic values if not a CustomError
  const {
    name = "Unknown Error",
    message = "No details provided",
    type = "error",
  } = error as CustomError;

  // Select the appropriate embed builder based on the error type
  const embed = {
    warning: CommonEmbedBuilder.warning,
    info: CommonEmbedBuilder.info,
    error: CommonEmbedBuilder.error,
  }[type]({
    title: name,
    description: message,
  });

  // Prepare the payload for the reply/followUp/editReply
  const payload = {
    embeds: [embed],
    files: attachments,
    ephemeral,
  };

  // Send the reply based on the newReply flag and interaction state

  if (newReply) {
    if (!interaction.replied) {
      await interaction.reply(payload);
    } else {
      await interaction.followUp(payload);
    }
  } else {
    await interaction.editReply(payload);
  }
}
