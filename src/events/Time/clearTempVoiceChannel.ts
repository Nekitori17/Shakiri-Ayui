import TemporaryVoiceChannel from "../../models/TemporaryVoiceChannel";
import { TimeEventInterface } from "../../types/EventInterfaces";
import { errorLogger } from "../../helpers/errors/handleError";

const schedule: TimeEventInterface = {
  async execute(client) {
    try {
      const channels = await TemporaryVoiceChannel.find();
      
      for (const channelData of channels) {
        try {
          const channel = await client.channels.fetch(channelData.channelId).catch(() => null);
          
          if (!channel) {
            // Channel was deleted in Discord but still in DB
            await TemporaryVoiceChannel.deleteOne({ channelId: channelData.channelId });
          } else if (channel.isVoiceBased()) {
            // Check if channel is empty or only bots
            const members = channel.members.filter(mem => !mem.user.bot);
            if (members.size === 0) {
              await TemporaryVoiceChannel.deleteOne({ channelId: channelData.channelId });
              await channel.delete().catch(() => {});
            }
          }
        } catch (error) {
          errorLogger(error);
        }
      }
    } catch (error) {
      errorLogger(error);
    }
  },
  mode: "INTERVAL",
  schedule: {
    interval: 86400,
    startTime: {
      hours: 0,
      minutes: 0,
    },
  },
};

export default schedule;
