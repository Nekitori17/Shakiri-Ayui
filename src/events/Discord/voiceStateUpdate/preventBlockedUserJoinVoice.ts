import path from "path";
import { VoiceState } from "discord.js";
import jsonStore from "json-store-typed";
import UserSettings from "../../../models/UserSettings";
import CommonEmbedBuilder from "../../../helpers/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const temporaryChannels = jsonStore(
    path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
  );

  if (!newState.channel) return;
  if (!newState.member) return;
  if (!temporaryChannels.get(newState.channel.id)) return;

  const userSettings = await UserSettings.findOne({
    userId: temporaryChannels.get(newState.channel.id),
  });

  if (
    userSettings?.temporaryVoiceChannel.blockedUsers.includes(
      newState.member.id
    )
  ) {
    await newState.member.voice.disconnect();
    newState.member.send({
      embeds: [
        CommonEmbedBuilder.info({
          title: "You are blocked",
          description: `You are blocked from joining the channel ${newState.channel.name}`,
        }),
      ],
    });
  }
};

export default event;
