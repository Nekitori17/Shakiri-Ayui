import config from "../../../config";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { Client, GuildMember, TextChannel } from "discord.js";

const event: DiscordEventInterface = async (
  client: Client,
  member: GuildMember
) => {
  if (!member.guild.channels.cache.has(config.modules.welcomer.channelSend)) return;
  const channelSend = member.guild.channels.cache.get(
    config.modules.welcomer.channelSend
  );

  interface ImageDataInterface {
    background: string;
    title: string;
    body: string;
    footer: string;
    avatar: string;
  }

  const imageData: ImageDataInterface = {
    background: config.modules.welcomer.backgroundImage,
    title: encodeURIComponent(member.displayName),
    body: encodeURIComponent(`Welcome to ${member.guild.name}`),
    footer: encodeURIComponent(`Member #${member.guild.memberCount}`),
    avatar: member.displayAvatarURL({ extension: "png", forceStatic: true }),
  };

  const linkImage = `https://api.popcat.xyz/welcomecard?background=${imageData.background}&text1=${imageData.title}&text2=${imageData.body}&text3=${imageData.footer}&avatar=${imageData.avatar}`;

  if (channelSend) {
    await (channelSend as TextChannel).send(
      `>>> **Welcome ${member} to ${member.guild.name}**` +
        "\n" +
        `Check Out <#1121001402731352145> To Know The Rule.` +
        "\n" +
        `__Yay Now We Have Total ${member.guild.memberCount} Members__`
    );

    (channelSend as TextChannel).send(linkImage);
  }
};

export default event;
