import { EmbedBuilder, TextChannel } from "discord.js";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("emptyQueue", (queue) => {
    // Send a message to the channel indicating the queue is empty
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