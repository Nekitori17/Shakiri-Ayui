import {
  ActionRowBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";
import { musicPlayerStoreSession } from "../../../musicPlayerStoreSession";

function isNumber(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to set volume",
        };

      const renameModal = new ModalBuilder()
        .setCustomId("music-player-volume")
        .setTitle("Set volume")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("level")
              .setLabel("Level")
              .setRequired(true)
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("0 - 100")
          )
        );

      await interaction.showModal(renameModal);
      const modalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      await modalInteraction.deferReply();
      try {
        const levelStr = modalInteraction.fields.getTextInputValue("level");
        if (!isNumber(levelStr))
          throw {
            name: "ThisIsNotANumber",
            message: "Please try again with correct value",
          };

        const level = parseInt(levelStr);

        if (level < 0 || level > 100)
          throw {
            name: "OutOfRange",
            message: "Please try again with value between 0 and 100",
          };

        queue.node.setVolume(level);
        musicPlayerStoreSession.volume.set(interaction.guildId!, level);
        modalInteraction.editReply(`🔊 Volume set to ${level}%`);
      } catch (error) {
        sendError(modalInteraction, error, true);
      }
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
