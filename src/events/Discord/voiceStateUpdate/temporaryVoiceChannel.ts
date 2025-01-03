import path from "path";
import config from "../../../config";
import jsonStore from "json-store-typed";
import { ChannelType, VoiceState } from "discord.js";
import UserSettings from "../../../models/UserSettings";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const settings = await config.modules(newState.guild.id!);
  if (!settings.temporaryVoiceChannel?.enabled) return;
  const temporaryChannels = jsonStore(
    path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
  );

  if (
    temporaryChannels.get(oldState.channelId!) &&
    newState.channelId !== oldState.channelId
  ) {
    if (
      oldState.channel &&
      oldState.channel.members.filter((mem) => !mem.user.bot).size === 0
    ) {
      temporaryChannels.del(oldState.channelId!);
      await oldState.channel.delete();
    }
  }

  if (newState.channelId !== settings.temporaryVoiceChannel?.channelSet) return;

  const query = { userId: newState.member?.id };
  const data = await UserSettings.findOne(query);

  const channelName =
    data?.temporaryVoiceChannel?.channelName ||
    settings.temporaryVoiceChannel?.nameChannelSyntax;

  await newState.guild.channels
    .create({
      name: channelName.replace(
        /{username}/gi,
        newState.member?.displayName || "Neko"
      ),
      type: ChannelType.GuildVoice,
      parent:
        settings.temporaryVoiceChannel?.categorySet ||
        newState.member?.voice.channel?.parentId,
      userLimit: data?.temporaryVoiceChannel?.limitUser || undefined,
      bitrate: 96000,
    })
    .then((channel) => {
      newState.member?.voice.setChannel(channel);
      temporaryChannels.set(channel.id, newState.member?.id);
    });
};

export default event;
