import prettyMilliseconds from "pretty-ms";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { useTimeline } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

/**
 * Parses a time string in colon-separated format (e.g., "3:20", "1:02:33", or "35") into milliseconds.
 * @param input The time string to parse.
 * @returns The time in milliseconds, or `null` if the input format is invalid.
 */
function parseColonTimeFormat(input: string): number | null {
  const parts = input.split(":").map(Number);

  if (parts.some(isNaN)) return null;
  // Convert time parts to milliseconds

  if (parts.length === 1) {
    return parts[0] * 1000;
  } else if (parts.length === 2) {
    const [min, sec] = parts;
    return (min * 60 + sec) * 1000;
  } else if (parts.length === 3) {
    const [hour, min, sec] = parts;
    return (hour * 3600 + min * 60 + sec) * 1000;
  } else {
    return null;
  }
}

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const timeOption = interaction.options.getString("time", true);

      // Get the timeline for the current guild's music queue
      const trackTimeline = useTimeline({ node: interaction.guildId! });

      // If no timeline exists (no queue playing), throw a custom error
      if (!trackTimeline)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to seek",
        });

      console.log(trackTimeline.timestamp);

      // Parse the provided time option into milliseconds
      const timeInMs = parseColonTimeFormat(timeOption);

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

      // Edit the deferred reply with an embed confirming the seek operation
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Seeked to \`${prettyMilliseconds(timeInMs, {
                colonNotation: true,
              })}\``,
              iconURL: "https://img.icons8.com/color/512/time.png",
            })
            .setColor("#73ff00"),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "seek",
  description: "Seek to specific time in the song",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "time",
      description: "The time to seek to (e.g., 3:20, 1:02:33 or 35)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: true,
};

export default command;
