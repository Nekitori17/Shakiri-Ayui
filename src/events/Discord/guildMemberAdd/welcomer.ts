import config from "../../../config";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { Client, GuildMember, TextChannel } from "discord.js";

const event: DiscordEventInterface = async (
  client: Client,
  member: GuildMember
) => {
  const settings = await config.modules(member.guild.id);
  if (!settings.welcomer?.enabled) return;
  if (!member.guild.channels.cache.has(settings.welcomer?.channelSend || ""))
    return;
  const channelSend = member.guild.channels.cache.get(
    settings.welcomer?.channelSend || ""
  );

  function replacer(content: string) {
    const result = content
      .replace("{user_display}", member.displayName)
      .replace("{user}", `<@${member.id}>`)
      .replace("{member_count}", member.guild.memberCount.toString())
      .replace("{guild}", member.guild.name);
    return result;
  }

  interface ImageDataInterface {
    background: string;
    title: string;
    body: string;
    footer: string;
    avatar: string;
  }

  if (channelSend) {
    const welcomeMessage = replacer(
      settings.welcomer?.customMessage ||
        "> Welcome {user} to __{guild}__."
    );

    await (channelSend as TextChannel).send(welcomeMessage);

    const imageData: ImageDataInterface = {
      background:
        settings.welcomer?.backgroundImage ||
        "https://i.ibb.co/BnCqSH0/banner.jpg",
      title: encodeURIComponent(
        replacer(settings.welcomer.imageTitle || "{user_display}")
      ),
      body: encodeURIComponent(
        replacer(settings.welcomer.imageBody || `Welcome to {guild}`)
      ),
      footer: encodeURIComponent(
        replacer(settings.welcomer.imageFooter || `Member #{member_count}`)
      ),
      avatar: member.displayAvatarURL({
        extension: "png",
        forceStatic: true,
      }),
    };

    const linkImage = `https://api.popcat.xyz/welcomecard?background=${imageData.background}&text1=${imageData.title}&text2=${imageData.body}&text3=${imageData.footer}&avatar=${imageData.avatar}`;
    (channelSend as TextChannel).send(linkImage);
  }
};

export default event;
