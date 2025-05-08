import path from "path";
import config from "../../../config";
import jsonStore from "json-store-typed";
import { ChannelType, VoiceState } from "discord.js";
import UserSettings from "../../../models/UserSettings";
import { genericVariableReplacer } from "../../../helpers/variableReplacer";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  const settings = await config.modules(newState.guild.id!);
  if (!settings.temporaryVoiceChannel.enabled) return;
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

  if (newState.channelId !== settings.temporaryVoiceChannel.channelSet) return;

  const userSettings = await UserSettings.findOne({
    userId: newState.member?.id,
  });

  const channelName =
    userSettings?.temporaryVoiceChannel?.channelName ||
    settings.temporaryVoiceChannel.nameChannelSyntax;

  await newState.guild.channels
    .create({
      name: genericVariableReplacer(
        channelName,
        newState.member!,
        newState.guild!,
        client
      ),
      type: ChannelType.GuildVoice,
      parent:
        settings.temporaryVoiceChannel.categorySet ||
        newState.member?.voice.channel?.parentId,
      userLimit: userSettings?.temporaryVoiceChannel?.limitUser || undefined,
      bitrate: 96000,
    })
    .then((channel) => {
      newState.member?.voice.setChannel(channel);
      temporaryChannels.set(channel.id, newState.member?.id);
    });
};

export default event;
