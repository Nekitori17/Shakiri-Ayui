import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { EmbedBuilder, TextChannel } from "discord.js";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("emptyQueue", (queue) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "🎶 | Queue is now empty!",
            iconURL: "https://img.icons8.com/fluency/512/end.png",
          }
          )
          .setDescription("Come on, add some music!")
          .setColor("Orange")
      ]
    });
  });
};

export default event