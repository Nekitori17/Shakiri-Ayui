import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
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

      const volumeChangeModal = new ModalBuilder()
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

      await interaction.showModal(volumeChangeModal);
      const volumeChangeInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      try {
        await volumeChangeInteraction.deferReply();
        const levelStrInputValue =
          volumeChangeInteraction.fields.getTextInputValue("level");
        if (!isNumber(levelStrInputValue))
          throw {
            name: "ThisIsNotANumber",
            message: "Please try again with correct value",
          };

        const level = parseInt(levelStrInputValue);

        if (level < 0)
          throw {
            name: "OutOfRange",
            message: "Please try again with value between 0 and 100",
          };

        queue.node.setVolume(level);
        musicPlayerStoreSession.volume.set(interaction.guildId!, level);
        volumeChangeInteraction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `🎶 Volume set to ${level}!`,
                iconURL: "https://img.icons8.com/color/512/low-volume.png",
              })
              .setColor("#73ff00"),
          ],
        });
      } catch (error) {
        sendError(volumeChangeInteraction, error, true);
      }
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
