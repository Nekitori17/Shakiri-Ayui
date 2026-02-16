import { GuildMember, Message } from "discord.js";
import { useMainPlayer } from "discord-player";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, message: Message) => {
  try {
    if (
      !message.content.startsWith(
        `${(await client.getGuildSetting(message.guildId!)).prefix}s`
      )
    )
      return;

    const messageSay = message.content.slice(2);

    const player = useMainPlayer();

    await player.play(
      (message.member as GuildMember).voice.channel!,
      `tts:${messageSay}`,
      {
        requestedBy: message.author,
        nodeOptions: {
          metadata: {
            channel: message.channel,
            doNotLog: true,
          },
          volume: 100,
          leaveOnEmpty: false,
          leaveOnEnd: false,
        },
      }
    );

    message.react("✅");
  } catch (error: any) {
    message.reply({
      embeds: [
        client.CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  }
};

export default event;
