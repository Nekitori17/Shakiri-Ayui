import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { EmbedBuilder, TextChannel } from "discord.js";
import { musicSourceIcons } from "../../data/musicSourceIcons";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("audioTrackAdd", (queue, track) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `🎶 | Added ${track.title} by ${track.author} to the queue!`,
            iconURL: track.thumbnail,
            url: track.url
          })
          .setFooter({
            text: `Request by: ${track.requestedBy?.displayName}`,
            iconURL: musicSourceIcons[track.source]
          })
          .setColor("Green"),
      ],
    });
  });
};

export default event