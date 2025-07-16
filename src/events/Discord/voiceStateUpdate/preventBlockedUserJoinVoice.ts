import path from "path";
import { VoiceState } from "discord.js";
import jsonStore from "json-store-typed";
import { errorLogger } from "../../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import UserSettings from "../../../models/UserSettings";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  try {
    // Initialize a JSON store for temporary voice channels
    const temporaryChannels = jsonStore(
      path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
    );

    // If the user is not in a new channel, or there's no member, return
    if (!newState.channel) return;
    if (!newState.member) return;
    // If the new channel is not a temporary channel, return
    if (!temporaryChannels.get(newState.channel.id)) return;

    const userSetting = await UserSettings.findOne({
      userId: temporaryChannels.get(newState.channel.id),
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
          CommonEmbedBuilder.warning({
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
