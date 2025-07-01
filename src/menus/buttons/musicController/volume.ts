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
import { MusicPlayerSession } from "../../../musicPlayerStoreSession";

/**
 * Checks if a given value is a number.
 * @param value The value to check.
 * @returns True if the value is a number, false otherwise.
 */
function isNumber(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);

      // Check if a queue exists
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to set volume",
        };

      // Create a modal for volume change
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

      // Show the modal to the user
      await interaction.showModal(volumeChangeModal);
      // Wait for the user to submit the modal
      const volumeChangeInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      try {
        await volumeChangeInteraction.deferReply();

        // Get the value of the "level" text input
        const levelStrInputValue =
          volumeChangeInteraction.fields.getTextInputValue("level");
        // Check if the input value is a valid number

        // Error message for invalid input
        if (!isNumber(levelStrInputValue))
          throw {
            name: "ThisIsNotANumber",
            message: "Please try again with correct value",
          };

        const level = parseInt(levelStrInputValue);
        // Check if the volume level is out of range
        if (level < 0)
          throw {
            name: "OutOfRange",
            message: "Please try again with value between 0 and 100",
          };

        queue.node.setVolume(level);
        // Set the volume in the session store
        const musicPlayerStoreSession = new MusicPlayerSession(
          interaction.guildId!
        );
        musicPlayerStoreSession.setVolume(level);

        // Edit the reply with an embed confirming the volume change
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
