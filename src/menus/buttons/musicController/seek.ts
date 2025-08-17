import _ from "lodash";
import prettyMilliseconds from "pretty-ms";
import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { useTimeline } from "discord-player";
import { FnUtils } from "../../../helpers/FnUtils";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");

    try {
      // Get the timeline for the current guild's music playback
      const trackTimeline = useTimeline({
        node: interaction.guildId!,
      });

      // If no timeline exists, throw a custom error
      if (!trackTimeline)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to set seek",
        });

      // Create a modal for seeking to a specific time
      const seekModal = new ModalBuilder()
        .setCustomId("music-player-seek")
        .setTitle("Seek")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("time")
              .setLabel("The time to seek")
              .setRequired(true)
              .setStyle(TextInputStyle.Short)
              // Placeholder for example time formats
              .setPlaceholder(`E.g., 3:20, 1:02:33 or 35`)
          )
        );

      // Show the modal to the user
      await interaction.showModal(seekModal);

      // Wait for the user to submit the modal
      const seekModalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      try {
        // Defer the reply to the modal submission, making it ephemeral if from a control panel button
        await seekModalInteraction.deferReply({
          flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
        });

        // Get the time input value from the modal
        const timeStrInputValue =
          seekModalInteraction.fields.getTextInputValue("time");

        // Parse the provided time option into milliseconds
        const timeInMs = FnUtils.parseColonTimeFormat(timeStrInputValue);

        if (!timeInMs || timeInMs < 0) {
          // If the parsed time is invalid or negative, throw a custom error
          throw new CustomError({
            name: "InvalidTime",
            message:
              "Please provide a valid time format like `3:20`, `1:02:33` or `35``",
          });
        }

        // If the provided time exceeds the track's total duration, throw a custom error
        if (timeInMs > trackTimeline.timestamp.total.value) {
          throw new CustomError({
            name: "TimeOutOfRange",
            message: `The provided time exceeds the track's duration (\`${trackTimeline.track?.duration}\`)`,
          });
        }

        // Set the position of the current track in the timeline
        trackTimeline.setPosition(timeInMs);

        // Edit the reply with an embed confirming the seek
        seekModalInteraction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `🎶 Seeked to \`${prettyMilliseconds(timeInMs, {
                  colonNotation: true,
                })}`,
                iconURL: "https://img.icons8.com/color/512/time.png",
              })
              .setColor("#73ff00"),
          ],
        });

        return true;
      } catch (error) {
        handleInteractionError(seekModalInteraction, error, controlPanelButtonIn);

        return false;
      }
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
