import { Client, Message, TextChannel } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import CountingGame from "../../../models/CountingGame";

const event: DiscordEventInterface = async (client: Client, msg: Message) => {
  if (msg.author.bot) return;

  const query = {
    guildId: msg.guildId,
  };

  try {
    const data = await CountingGame.findOne(query);

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
