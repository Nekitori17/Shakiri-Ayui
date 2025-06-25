import { EmbedBuilder, TextChannel } from "discord.js";
import { QueueRepeatMode, TrackSource } from "discord-player";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { mainMusicControllerButtonsRow } from "../../components/musicControllerMenu";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("playerStart", async (queue, track) => {
    const volume =
      (musicPlayerStoreSession.volume.get(queue.guild.id) as Number) ||
      queue.node.volume;
    const repeatMode =
      (musicPlayerStoreSession.loop.get(queue.guild.id) as QueueRepeatMode) ||
      queue.repeatMode;
    const shuffeledTimes =
      (musicPlayerStoreSession.shuffeld.get(queue.guild.id) as number) || 0;

    (queue.metadata.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: track.author,
          })
          .setTitle(`> ${track.title}`)
          .setDescription(
            `* <:colorgenderneutraluser:1387288588798005248> **Requested by** ${track.requestedBy}` +
              "\n" +
              `* <:colorvolume:1387283301202526269> **Volume**: ${volume.toString()}%` +
              "\n" +
              `* <:colorvisible:1387281699859070976> **View**: ${track.views.toLocaleString()}` +
              "\n" +
              `* <:colorsynchronize:1387283489883164733> **Loop**: ${
                repeatModeNames[repeatMode || 0]
              }` +
              "\n" +
              `* <:colorshuffle:1387283637191442553> **Shuffled**: ${
                shuffeledTimes > 1
                  ? `${shuffeledTimes} times`
                  : `${shuffeledTimes} time`
              }`
          )
          .setURL(track.url)
          .setThumbnail(track.thumbnail)
          .setFooter({
            text: `Duration: ${track.duration}`,
            iconURL: musicSourceIcons[track.source as TrackSource],
          })
          .setColor("#00a2ff")
          .setTimestamp(),
      ],
      components: [mainMusicControllerButtonsRow],
    });
  });
};

export default event;
