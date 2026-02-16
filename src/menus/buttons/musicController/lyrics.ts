import { EmbedBuilder, MessageFlags } from "discord.js";
import { useMainPlayer, useQueue } from "discord-player";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes(
      client.constants.CONTROL_PANEL_TAG,
    );

    try {
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });

      // Get the main player instance
      const player = useMainPlayer();
      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists
      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to stop",
        });

      // Search for lyrics using the current track's title and author
      const lyrics = await player.lyrics.search({
        q: queue.currentTrack?.title,
        artistName: queue.currentTrack?.author,
      });

      // Check if any lyrics were found
      if (!lyrics.length)
        throw new client.CustomError({
          name: "NoLyrics",
          message: "There is no lyrics to show",
        });

      // Trim the lyrics to fit within Discord's embed description limit
      const trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
      // Edit the reply with an embed containing the lyrics
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
      client.interactionErrorHandler(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};
export default button;
