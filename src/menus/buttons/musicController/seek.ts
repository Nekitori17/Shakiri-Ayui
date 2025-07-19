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
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { parseColonTimeFormat } from "../../../helpers/utils/parseTimeFormat";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");
    
    try {
      const trackTimeline = useTimeline({
        node: interaction.guildId!,
      });

      if (!trackTimeline)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to set seek",
        });

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
              .setPlaceholder(`E.g., 3:20, 1:02:33 or 35`)
          )
        );

      await interaction.showModal(seekModal);

      const seekModalInteraction = await interaction.awaitModalSubmit({
        time: 60000,
      });

      try {

        await seekModalInteraction.deferReply({
          flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
        });

        const timeStrInputValue =
          seekModalInteraction.fields.getTextInputValue("time");

        // Parse the provided time option into milliseconds
        const timeInMs = parseColonTimeFormat(timeStrInputValue);

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

        trackTimeline.setPosition(timeInMs);

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
