import {
  AttachmentBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageFlags,
  MessagePayload,
} from "discord.js";
import CommonEmbedBuilder from "./commonEmbedBuilder";
import { AnyInteraction } from "../types/AnyIntreaction";

function convertErrorToString(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const fullError: Record<string, unknown> = {};
  const keys = Object.getOwnPropertyNames(error);

  for (const key of keys) {
    const value = (error as Record<string, unknown>)[key];
    fullError[key] =
      value instanceof Object ? convertErrorToString(value) : value;
  }

  return JSON.stringify(fullError, null, 2);
}

interface CustomError {
  name: string;
  message: string;
  type: "error" | "warn";
}

export default async (
  interaction: AnyInteraction,
  error: Error | CustomError | unknown,
  ephemeral = false,
  mode: "edit" | "reply" = "edit"
): Promise<void> => {
  if (!interaction.replied && !interaction.deferred) {
    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
  }

  const errorDetails = {
    name:
      error instanceof Error
        ? error.name
        : (error as CustomError)?.name || "Unknown",
    message:
      error instanceof Error
        ? error.message
        : (error as CustomError)?.message || "No message provided",
    stack: error instanceof Error ? error.stack : undefined,
    cause: (error as any)?.cause,
  };

  const fileContent = [
    `# Error Name: ${errorDetails.name}`,
    `# Error Message: ${errorDetails.message}`,
    `# Time: ${new Date().toISOString()}`,
    `# Error at: ${errorDetails.stack || "N/A"}`,
    `# Error Cause: ${errorDetails.cause || "N/A"}`,
    "========================",
    convertErrorToString(error),
  ].join("\n");

  const moreErrorInfo =
    error instanceof Error
      ? [
          new AttachmentBuilder(Buffer.from(fileContent), {
            name: `Error-${new Date().toISOString()}_${(
              process.hrtime.bigint() / 1000000n
            ).toString()}.log`,
          }),
        ]
      : [];

  const errorEmbed =
    (error as CustomError)?.type === "warn"
      ? CommonEmbedBuilder.warning({
          title: errorDetails.name,
          description: errorDetails.message,
        })
      : CommonEmbedBuilder.error({
          title: errorDetails.name,
          description: errorDetails.message,
        });

  const replyFunction = interaction[
    mode === "edit" ? "editReply" : "reply"
  ] as (
    options: string | MessagePayload | InteractionEditReplyOptions
  ) => Promise<Message<boolean>>;

  await replyFunction({
    content: null,
    components: [],
    attachments: [],
    embeds: [errorEmbed],
    files: moreErrorInfo,
  });
};
