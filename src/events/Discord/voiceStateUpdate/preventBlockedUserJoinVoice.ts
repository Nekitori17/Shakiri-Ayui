import { VoiceState } from "discord.js";
import { errorLogger } from "../../../helpers/errors/handleError";
import UserSettings from "../../../models/UserSettings";
import TemporaryVoiceChannel from "../../../models/TemporaryVoiceChannel";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  try {
    // If the user is not in a new channel, or there's no member, return
    if (!newState.channel) return;
    if (!newState.member) return;

    // Check if the new channel is a temporary channel
    const tempChannelDoc = await TemporaryVoiceChannel.findOne({ channelId: newState.channel.id });
    if (!tempChannelDoc) return;

    const userSetting = await UserSettings.findOne({
      userId: tempChannelDoc.userId,
    });

    // Check if the user is blocked from joining the channel
    if (
      userSetting?.temporaryVoiceChannel.blockedUsers.includes(
        newState.member.id
      )
    ) {
      await newState.member.voice.disconnect();

      newState.member.send({
        embeds: [
          client.CommonEmbedBuilder.warning({
            title: "You are blocked",
            description: `You are blocked from joining the channel`,
          }),
        ],
      });
    }
  } catch (error) {
    errorLogger(error);
  }
};

export default event;
