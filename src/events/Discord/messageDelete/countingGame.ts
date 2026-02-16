import { Message } from "discord.js";
import CountingGame from "../../../models/miniGames/CountingGame";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, msg: Message) => {
  if (msg.author.bot) return;

  try {
    const guildCountingGameData = await CountingGame.findOne({
      guildId: msg.guildId,
    });

    if (!guildCountingGameData) return;

    if (guildCountingGameData.latestMessageId === msg.id) {
      guildCountingGameData.countingCurrentNumber -= 1;
      await guildCountingGameData.save();
    }
  } catch (error: any) {
    await msg.delete();
    if (msg.channel.isSendable())
      msg.channel.send({
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
