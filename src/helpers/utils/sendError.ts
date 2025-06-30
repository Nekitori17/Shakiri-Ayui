import { AttachmentBuilder, MessageFlags } from "discord.js";
import CommonEmbedBuilder from "../embeds/commonEmbedBuilder";
import { AnyInteraction } from "../../types/AnyInteraction";

/**
 * Recursively converts an unknown error object into a readable JSON string.
 *
 * @param error - The error object (can be any shape).
 * @returns A prettified string representation of the error.
 */
function convertErrorToString(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const fullErrorObject: Record<string, unknown> = {};
  const keys = Object.getOwnPropertyNames(error);

  for (const key of keys) {
    const value = (error as Record<string, unknown>)[key];
    fullErrorObject[key] =
      value instanceof Object ? convertErrorToString(value) : value;
  }

  return JSON.stringify(fullErrorObject, null, 2);
}

/**
 * A simplified custom error structure to standardize error responses.
 */
interface CustomError {
  name: string;
  message: string;
  type: "error" | "warning" | "info";
}

/**
 * Handles an error by replying to the user interaction with a styled embed.
 * If the error is an instance of `Error`, it also attaches a log file.
 *
 * @param interaction - The interaction (slash, context menu, or message command).
 * @param error - The error object, which can be a native Error or a custom error.
 * @param ephemeral - Whether the reply should be ephemeral (hidden to others).
 */
export default async (
  interaction: AnyInteraction,
  error: Error | CustomError | any,
  ephemeral = false
): Promise<void> => {
  // Defer reply if interaction has not been responded to
  if (!interaction.replied && !interaction.deferred) {
    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
  }

  const moreErrorInfo: AttachmentBuilder[] = [];

  // If it's a native Error, create a detailed log attachment
  if (error instanceof Error) {
    const fileContent = [
      `# Error Name: ${error.name}`,
      `# Error Message: ${error.message}`,
      `# Time: ${new Date().toISOString()}`,
      `# Error at: ${error.stack || "N/A"}`,
      "========================",
      convertErrorToString(error),
    ].join("\n");

    moreErrorInfo.push(
      new AttachmentBuilder(Buffer.from(fileContent), {
        name: `Error-${new Date().toISOString()}_${(
          process.hrtime.bigint() / 1000000n
        ).toString()}.log`,
      })
    );
  }

  // Choose embed type based on custom error `type` field
  const errorEmbed =
    (error as CustomError)?.type === "warning"
      ? CommonEmbedBuilder.warning({
          title: error.name,
          description: error.message,
        })
      : (error as CustomError)?.type === "info"
      ? CommonEmbedBuilder.info({
          title: error.name,
          description: error.message,
        })
      : CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        });

  // Send the embed and any attachments to the interaction
  await interaction.followUp({
    embeds: [errorEmbed],
    files: moreErrorInfo,
  });
};
