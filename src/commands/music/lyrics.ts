import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { LrcSearchResult, useMainPlayer, useQueue } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const queryOption = interaction.options.getString("query");

      const player = useMainPlayer();
      let trimmedLyrics: string;
      let lyrics: LrcSearchResult[];

      // Check if a query option is provided
      if (queryOption) {
        // Search for lyrics using the provided query
        lyrics = await player.lyrics.search({
          q: queryOption,
        });

        if (!lyrics.length)
          throw new CustomError({
            name: "NoLyrics",
            message: "There is no lyrics to show",
          });

        // Trim lyrics to fit embed description limit
        trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
      } else {
        // If no query, try to get lyrics for the current playing track
        const queue = useQueue(interaction.guildId!);

        if (!queue)
          throw new CustomError({
            name: "NoQueue",
            message: "There is no queue to get lyrics",
          });

        // Search for lyrics of the current track
        lyrics = await player.lyrics.search({
          q: queue.currentTrack?.title,
        });

        if (!lyrics.length)
          throw new CustomError({
            name: "NoLyrics",
            message: "There is no lyrics to show",
          });

        // Trim lyrics to fit embed description limit
        trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
      }

      // Edit the deferred reply with the lyrics embed
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: lyrics[0].artistName,
            })
            .setTitle(lyrics[0].trackName)
            .setDescription(
              trimmedLyrics.length === 1997
                ? `${trimmedLyrics}...`
                : trimmedLyrics
            )
            .setColor("Yellow")
            .setFooter({
              text: `Duration: ${lyrics[0].duration}`,
            }),
        ],
      });

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "lyrics",
  description: "Get lyrics of the song in query or current song",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "query",
      description: "The song to play",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
