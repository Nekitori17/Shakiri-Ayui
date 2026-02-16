import { GuildMember } from "discord.js";
import { errorLogger } from "../../../helpers/errors/handleError";
import generateWelcomeImage from "../../../helpers/generators/generateWelcomeImage";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, member: GuildMember) => {
  try {
    const guildSetting = await client.getGuildSetting(member.guild.id);

    if (!guildSetting.welcomer.enabled) return;

    const welcomerChannelSend = member.guild.channels.cache.get(
      guildSetting.welcomer.channelSend || ""
    );

    if (!welcomerChannelSend) return;
    if (!welcomerChannelSend.isSendable()) return;

    const welcomeMessage = client.utils.genericVariableFormatter(
      guildSetting.welcomer.message,
      member,
      member.guild,
      client
    );

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

    await welcomerChannelSend.send(welcomeMessage);
    if (welcomeImage)
      welcomerChannelSend.send({
        files: [welcomeImage],
      });
  } catch (error) {
    errorLogger(error);
  }
};

export default event;
