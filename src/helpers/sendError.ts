import { AttachmentBuilder, MessageFlags } from "discord.js";
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
  type: "error" | "warning";
}

export default async (
  interaction: AnyInteraction,
  error: Error | CustomError | any,
  ephemeral = false
): Promise<void> => {
  if (!interaction.replied && !interaction.deferred) {
    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
  }

  const moreErrorInfo: AttachmentBuilder[] = [];
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

  const errorEmbed =
    (error as CustomError)?.type === "warning"
      ? CommonEmbedBuilder.warning({
          title: error.name,
          description: error.message,
        })
      : CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        });

  await interaction.followUp({
    embeds: [errorEmbed],
    files: moreErrorInfo,
  });
};
