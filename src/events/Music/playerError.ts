import { TextBasedChannel } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { errorLogger } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("playerError", (queue, error, track) => {
    try {
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
            footer: `Track: ${track.title}`,
          }),
        ],
      });
    } catch (error) {
      if (error instanceof Error) errorLogger(error);
    }
  });
};

export default event;
