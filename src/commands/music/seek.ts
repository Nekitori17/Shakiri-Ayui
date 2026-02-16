import prettyMilliseconds from "pretty-ms";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { useTimeline } from "discord-player";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const timeOption = interaction.options.getString("time", true);

      const trackTimeline = useTimeline({ node: interaction.guildId! });

      if (!trackTimeline)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to seek",
        });

      const timeInMs = client.FnUtils.parseColonTimeFormat(timeOption);

      if (!timeInMs || timeInMs < 0) {
        throw new client.CustomError({
          name: "InvalidTime",
          message:
            "Please provide a valid time format like `3:20`, `1:02:33` or `35``",
          type: "warning",
        });
      }

      if (timeInMs > trackTimeline.timestamp.total.value) {
        throw new client.CustomError({
          name: "TimeOutOfRange",
          message: `The provided time exceeds the track's duration (\`${trackTimeline.track?.duration}\`)`,
          type: "warning",
        });
      }
      trackTimeline.setPosition(timeInMs);

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
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "seek",
  description: "Seek to specific time in the song",
  disabled: false,
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
