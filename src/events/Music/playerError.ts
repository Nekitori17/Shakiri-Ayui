import { TextChannel } from "discord.js";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("playerError", (queue, error, track) => {
    // Send a message to the channel indicating the error
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
          footer: `Track: ${track.title}`,
        }),
      ],
    });
  });
};

export default event;
