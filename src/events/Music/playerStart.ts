import { EmbedBuilder, TextChannel } from "discord.js";
import { TrackSource } from "discord-player";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("playerStart", async (queue, track) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: track.author,
          })
          .setTitle(`> ${track.title}`)
          .setDescription(
            `* Requested by ${track.requestedBy}` +
              "\n" +
              `* Volume: ${queue.options.volume.toString()}` +
              "\n" +
              `* Loop: ${repeatModeNames[queue.options.repeatMode || 0]}` +
              "\n" +
              `* Shuffled: ${queue.isShuffling ? "On" : "Off"}`
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
    });
  });
};

export default event;
