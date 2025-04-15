import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useMainPlayer, useQueue } from "discord-player";
import sendError from "../../helpers/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const query = interaction.options.get("query")?.value as string;

    try {
      const player = useMainPlayer();

      if (query) {
        const lyrics = await player.lyrics.search({
          q: query,
        });

        if (!lyrics.length)
          throw {
            name: "NoLyrics",
            message: "There is no lyrics to show",
          };

        const trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
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
      } else {
        const queue = useQueue(interaction.guildId!);

        if (!queue)
          throw {
            name: "NoQueue",
            message: "There is no queue to get lyrics",
          };

        const lyrics = await player.lyrics.search({
          q: queue.currentTrack?.title,
        });

        if (!lyrics.length)
          throw {
            name: "NoLyrics",
            message: "There is no lyrics to show",
          };

        const trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
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
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "lyrics",
  description: "Get lyrics of the song in query or current song",
  deleted: false,
  options: [
    {
      name: "query",
      description: "The song to play",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
