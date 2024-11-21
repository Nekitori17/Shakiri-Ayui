import { repeatModeNames } from "../../data/musicRepeatModes";
import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { EmbedBuilder, TextChannel } from "discord.js";
import { musicSourceIcons } from "../../data/musicSourceIcons";

const event: MusicEventInterface = (player: Player) => {
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
              `* Views: ${track.views.toLocaleString("vi-VN")}` +
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
            iconURL: musicSourceIcons[track.source],
          })
          .setColor("#00a2ff")
          .setTimestamp(),
      ],
    });
  });
};

export default event;
