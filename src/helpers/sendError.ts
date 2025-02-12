import {
  AttachmentBuilder,
  ButtonInteraction,
  CommandInteraction,
  MessageContextMenuCommandInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import CommonEmbedBuilder from "./commonEmbedBuilder";

export default async(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | StringSelectMenuInteraction,
  error: { name: string; message: string; stack: string; cause: string } | any
) => {
  if (!interaction.replied && !interaction.deferred) await interaction.deferReply();

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
    error;

  const moreErrorInfo = new AttachmentBuilder(Buffer.from(content), {
    name: `Error-${Date()}_${(
      process.hrtime.bigint() / 1000000n
    ).toString()}.log`,
  });

  interaction.editReply({
    content: null,
    components: undefined,
    attachments: undefined,
    embeds: [
      CommonEmbedBuilder.error({
        title: error.name,
        description: error.message,
      }),
    ],
    files: [moreErrorInfo],
  });
};
