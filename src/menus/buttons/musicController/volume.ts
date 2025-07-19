import _ from "lodash";
import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { useQueue } from "discord-player";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { MusicPlayerSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");
    
    try {
      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);

      // Check if a queue exists
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to set volume",
        });

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
        await volumeChangeInteraction.deferReply({
          flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
        });

        // Get the value of the "level" text input
        const levelStrInputValue =
          volumeChangeInteraction.fields.getTextInputValue("level");
        // Check if the input value is a valid number

        // Error message for invalid input
        if (!_.isNumber(levelStrInputValue))
          throw new CustomError({
            name: "ThisIsNotANumber",
            message: "Please try again with correct value",
            type: "warning",
          });

        const level = parseInt(levelStrInputValue);
        // Check if the volume level is out of range
        if (level < 0)
          throw new CustomError({
            name: "InvalidVolume",
            message: "Volume cannot be less than 0",
            type: "warning",
          });

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
        handleInteractionError(volumeChangeInteraction, error, controlPanelButtonIn);
      }

      return true;
    } catch (error) {
      handleInteractionError(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
