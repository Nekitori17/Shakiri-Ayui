import config from "../../../config";
import { GuildMember } from "discord.js";
import { errorLogger } from "../../../helpers/utils/handleError";
import generateWelcomeImage from "../../../helpers/tools/generateWelcomeImage";
import { genericVariableReplacer } from "../../../helpers/utils/variableReplacer";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, member: GuildMember) => {
  try {
    // Get guild settings
    const guildSetting = await config.modules(member.guild.id);

    // Check if welcomer module is enabled
    if (!guildSetting.welcomer.enabled) return;

    // Get the welcomer channel
    const welcomerChannelSend = member.guild.channels.cache.get(
      guildSetting.welcomer.channelSend || ""
    );

    // Validate the welcomer channel
    if (!welcomerChannelSend) return;
    if (!welcomerChannelSend.isSendable()) return;

    // Generate the welcome message
    const welcomeMessage = genericVariableReplacer(
      guildSetting.welcomer.message,
      member,
      member.guild,
      client
    );

    // Generate the welcome image
    const welcomeImage = await generateWelcomeImage(
      {
        title: guildSetting.welcomer.imageTitle,
        body: guildSetting.welcomer.imageBody,
        footer: guildSetting.welcomer.imageFooter,
      },
      member,
      member.guild,
      client
    );

    // Send the welcome message
    await welcomerChannelSend.send(welcomeMessage);
    // Send the welcome image if available
    if (welcomeImage)
      welcomerChannelSend.send({
        files: [welcomeImage],
      });
  } catch (error) {
    errorLogger(error);
  }
};

export default event;
