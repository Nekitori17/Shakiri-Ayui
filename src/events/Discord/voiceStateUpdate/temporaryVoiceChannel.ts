import config from "../../../config";
import path from "path";
import { ChannelType, VoiceState } from "discord.js";
import jsonStore from "json-store-typed";
import UserSettings from "../../../models/UserSettings";
import { genericVariableReplacer } from "../../../helpers/utils/variableReplacer";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  // Fetch guild settings for the current guild
  const guildSetting = await config.modules(newState.guild.id!);

  // If temporary voice channels are not enabled for this guild, return
  if (!guildSetting.temporaryVoiceChannel.enabled) return;

  // Initialize a JSON store for temporary voice channels
  const temporaryChannels = jsonStore(
    path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
  );

  // Check if the user is leaving a temporary channel and if it's now empty
  if (
    temporaryChannels.get(oldState.channelId!) &&
    newState.channelId !== oldState.channelId
  ) {
    // If the old channel exists and has no non-bot members, delete it
    if (
      oldState.channel &&
      oldState.channel.members.filter((mem) => !mem.user.bot).size === 0
    ) {
      temporaryChannels.del(oldState.channelId!); // Remove the channel from the temporary channels store
      await oldState.channel.delete(); // Delete the voice channel
    }
  }

  // If the user is not joining the designated temporary channel creation channel, return
  if (newState.channelId !== guildSetting.temporaryVoiceChannel.channelSet)
    return;

  // Fetch user settings for the member who joined
  const userSetting = await UserSettings.findOne({
    userId: newState.member?.id,
  });

  // Determine the channel name based on user settings or guild settings
  const channelName =
    userSetting?.temporaryVoiceChannel?.channelName ||
    guildSetting.temporaryVoiceChannel.nameChannelSyntax;

  // Create a new voice channel
  newState.guild.channels
    .create({
      name: genericVariableReplacer(
        channelName,
        newState.member!,
        newState.guild!,
        client
      ),
      type: ChannelType.GuildVoice,
      parent:
        guildSetting.temporaryVoiceChannel.categorySet ||
        newState.member?.voice.channel?.parentId,
      userLimit: userSetting?.temporaryVoiceChannel?.limitUser || undefined,
      bitrate: 96000,
    })
    .then((channel) => {
      // Once the channel is created
      newState.member?.voice.setChannel(channel); // Move the user to the newly created channel
      temporaryChannels.set(channel.id, newState.member?.id); // Store the new channel ID and its owner's ID
    });
};

export default event;
