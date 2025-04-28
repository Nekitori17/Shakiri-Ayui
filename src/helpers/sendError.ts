import {
  AttachmentBuilder,
  MessageFlags

} from "discord.js";
import CommonEmbedBuilder from "./commonEmbedBuilder";
import { AnyInteraction } from "../types/AnyIntreaction";

function convertErrorToString(error: any) {
  const fullError: { [key: string]: any } = {};

  const keys = Object.getOwnPropertyNames(error);
  for (const key of keys) {
    fullError[key] = error[key];
  }
  return JSON.stringify(fullError, null, 2);
}

export default async (
  interaction: AnyInteraction,
  error: Error | any,
  ephemeral: boolean = false,
  mode: "edit" | "reply" = "edit"
) => {
  if (!interaction.replied && !interaction.deferred)
    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });

  const content =
    `# Error Name: ${error.name}` +
    "\n" +
    `# Error Message: ${error.message}` +
    "\n" +
    `# Time: ${new Date().toISOString()}` +
    "\n" +
    `# Error at: ${error.stack}` +
    "\n" +
    `# Error Cause: ${error.cause}` +
    "\n" +
    "========================" +
    "\n" +
    convertErrorToString(error);

  const moreErrorInfo = new AttachmentBuilder(Buffer.from(content), {
    name: `Error-${Date()}_${(
      process.hrtime.bigint() / 1000000n
    ).toString()}.log`,
  });

  interaction.editReply({
    content: null,
    components: [],
    attachments: [],
    embeds: [
      CommonEmbedBuilder.error({
        title: error.name,
        description: error.message,
      }),
    ],
    files: [moreErrorInfo],
  });
};
