import { ApplicationCommandType, Client, MessageContextMenuCommandInteraction } from 'discord.js';
import { ContextInterface } from "../../types/InteractionInterfaces";

const context: ContextInterface = {
  execute(interaction: MessageContextMenuCommandInteraction, client: Client) {
    const targetMessage = interaction.targetMessage
    interaction.reply(targetMessage.content.toUpperCase())
  },
  name: "Translate the message",
  shortName: "translate",
  type: ApplicationCommandType.Message,
  deleted: false
}

export default context