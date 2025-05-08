import config from "../../../config";
import { GuildMember } from "discord.js";
import generateWelcomeImage from "../../../helpers/generateWelcomeImage";
import { genericVariableReplacer } from "../../../helpers/variableReplacer";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, member: GuildMember) => {
  const settings = await config.modules(member.guild.id);
  if (!settings.welcomer.enabled) return;
  const channelSend = member.guild.channels.cache.get(
    settings.welcomer.channelSend || ""
  );

  if (!channelSend) return;
  if (!channelSend.isSendable()) return;

  const welcomeMessage = genericVariableReplacer(
    settings.welcomer.message,
    member,
    member.guild,
    client
  );
  const welcomeImage = await generateWelcomeImage(
    {
      title: settings.welcomer.imageTitle,
      body: settings.welcomer.imageBody,
      footer: settings.welcomer.imageFooter,
    },
    member,
    member.guild,
    client
  );

  await channelSend.send(welcomeMessage);
  if (welcomeImage)
    channelSend.send({
      files: [welcomeImage],
    });
};

export default event;
