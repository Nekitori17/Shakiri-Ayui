import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { EmbedBuilder, TextChannel } from "discord.js";
import { musicSourceIcons } from "../../data/musicSourceIcons";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("audioTracksAdd", (queue, track) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `🎶 | Added playlist to queue!`,
            iconURL: "https://img.icons8.com/fluency/512/playlist.png",
            url: track[0].playlist?.url
          })
          .setFooter({
            text: `Request by: ${track[0].requestedBy?.displayName}`,
            iconURL: musicSourceIcons[track[0].source]
          })
          .setColor("Green"),
      ],
    });
  });
};

export default event