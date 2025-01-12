import {
  AttachmentBuilder,
  CommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import CommonEmbedBuilder from "./commonEmbedBuilder";

export const sendError = (
  interaction:
    | CommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction,
  error: { name: string; message: string } & Error
) => {
  const content =
    "============Summary============" +
    "\n" +
    `> Name: ${error.name}` +
    "\n" +
    `> Message: ${error.message}` +
    "\n" +
    "============Details============" +
    "\n" +
    error;

  const moreErrorInfo = new AttachmentBuilder(Buffer.from(content), {
    name: `error-${Date()}_${(
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
