import { Message, TextChannel } from "discord.js";
import CountingGame from "../../../models/CountingGame";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, msg: Message) => {
  if (msg.author.bot) return;

  try {
    const data = await CountingGame.findOne({
      guildId: msg.guildId,
    });

    if (!data) return;

    if (data.latestMessageId === msg.id) {
      data.countingCurrent -= 1;
      await data.save();
    }
  } catch (error: { name: string; message: string } | any) {
    await msg.delete();
    (msg.channel as TextChannel).send(`> ${error.message}`);
  }
};

export default event;
