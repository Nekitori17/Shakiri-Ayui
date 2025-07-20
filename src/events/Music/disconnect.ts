import { TextBasedChannel } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { errorLogger } from "../../helpers/utils/handleError";
import { MusicPlayerSession } from "../../musicPlayerStoreSession";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("disconnect", (queue) => {
    try {
      const queueChannel = queue.metadata.channel as TextBasedChannel;

      if (!queueChannel.isSendable())
      throw new CustomError({
        name: "SendableChannelError",
          message: "The channel is not sendable.",
        });

      // Clear session data related to the music player for this guild
      const musicPlayerStoreSession = new MusicPlayerSession(queue.guild.id);
      musicPlayerStoreSession.clear();

      // Send a message to the channel indicating the bot is leaving
      queueChannel.send(
        "> <:colorhandpeace:1387288072030388307> | Looks like my job here is done. Leaving now!"
      );
    } catch (error) {
      if (error instanceof Error) errorLogger(error);
    }
  });
};

export default event;
