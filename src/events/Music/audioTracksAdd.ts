import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { EmbedBuilder, TextChannel } from "discord.js";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("audioTracksAdd", (queue, track) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `🎶 | Added playlist to queue!`,
            iconURL: "https://img.icons8.com/fluency/512/playlist.png",
          })
          .setFooter({
            text: `Request by: ${track[0].requestedBy?.displayName}`,
          })
          .setColor("Green"),
      ],
    });
  });
};

export default event