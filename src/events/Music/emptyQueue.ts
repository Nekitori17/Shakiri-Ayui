import { EmbedBuilder, TextBasedChannel } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { errorLogger } from "../../helpers/utils/handleError";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("emptyQueue", (queue) => {
    try {
      const queueChannel = queue.metadata.channel as TextBasedChannel;

      if (!queueChannel.isSendable())
        throw new CustomError({
          name: "SendableChannelError",
          message: "The channel is not sendable.",
        });

      // Send a message to the channel indicating the queue is empty
      queueChannel.send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 | Queue is now empty!",
              iconURL: "https://img.icons8.com/fluency/512/end.png",
            })
            .setDescription("Come on, add some music!")
            .setColor("Orange"),
        ],
      });
    } catch (error) {
      if (error instanceof Error) errorLogger(error);
    }
  });
};

export default event;
