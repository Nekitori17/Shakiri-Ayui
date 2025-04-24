import { useMainPlayer, useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";
import { EmbedBuilder } from "discord.js";

const button: ButtonInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const player = useMainPlayer();
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to stop",
        };

      const lyrics = await player.lyrics.search({
        q: queue.currentTrack?.title,
        artistName: queue.currentTrack?.author,
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
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
