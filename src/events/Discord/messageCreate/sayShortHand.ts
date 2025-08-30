import config from "../../../config";
import { GuildMember, Message } from "discord.js";
import { useMainPlayer } from "discord-player";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, message: Message) => {
  try {
    if (!message.content.startsWith(".s")) return;

    const messageSay = message.content.slice(2);

    // Get the main player instance
    const player = useMainPlayer();

    await player.play(
      (message.member as GuildMember).voice.channel!,
      `tts:${messageSay}`,
      {
        requestedBy: message.author,
        nodeOptions: {
          volume: 100,
          leaveOnEmpty: false,
          leaveOnEnd: false,
        },
      }
    ); // Edit the reply to confirm the track has been added to the queue

    message.reply(`Successfully said: **${message}**`);
  } catch (error: any) {
    message.reply({
      embeds: [
        CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  }
};

export default event;
