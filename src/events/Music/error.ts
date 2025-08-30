import { TextBasedChannel } from "discord.js";
import { errorLogger } from "../../helpers/utils/handleError";
import { CustomError } from "../../helpers/utils/CustomError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("error", (queue, error) => {
    try {
      if (!queue.metadata.channel) return errorLogger(error);

      const queueChannel = queue.metadata.channel as TextBasedChannel;

      if (!queueChannel.isSendable())
        throw new CustomError({
          name: "SendableChannelError",
          message: "The channel is not sendable.",
        });

      // Send a message to the channel indicating the error
      queueChannel.send({
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
    } catch (error) {
      if (error instanceof Error) errorLogger(error);
    }
  });
};

export default event;
