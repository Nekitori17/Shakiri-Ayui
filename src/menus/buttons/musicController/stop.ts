import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
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
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists
      if (!queue)
        // If no queue, throw an error
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to stop",
        });

      // Create "Yes" and "No" buttons for confirmation
      const confirmButtonRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("stop-confirm-yes")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("stop-confirm-no")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger)
        );

      // Send a confirmation message with "Yes" and "No" buttons
      const confirmStopReply = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Are you sure you want to stop the queue?",
              iconURL: "https://img.icons8.com/fluency/512/question-mark.png",
            })
            .setColor("#fbff00"),
        ],
        components: [confirmButtonRow],
      });

      // Create a collector for the confirmation buttons
      const confirmStopCollector =
        confirmStopReply.createMessageComponentCollector({
          time: 30000,
        });

      // Handle collection of a confirmation button interaction
      confirmStopCollector.on(
        "collect",
        async (confirmStopButtonInteraction) => {
          try {
            // If "No" is clicked, delete the confirmation message
            if (confirmStopButtonInteraction.customId === "stop-confirm-no")
              interaction.deleteReply();

            // If "Yes" is clicked, stop the queue
            if (confirmStopButtonInteraction.customId === "stop-confirm-yes") {
              interaction.editReply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: "🎶 Queue has been stopped!",
                      iconURL:
                        "https://img.icons8.com/color/512/do-not-disturb.png",
                    })
                    .setColor("#ff3131"),
                ],
                components: [],
              });

              // Delete the queue
              queue.delete();
              // Clear session data related to the queue
              const musicPlayerStoreSession = new MusicPlayerSession(
                interaction.guildId!
              );
              musicPlayerStoreSession.clear();
            }
          } catch (error) {
            handleInteractionError(interaction, error, controlPanelButtonIn);
          }
        }
      );

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
