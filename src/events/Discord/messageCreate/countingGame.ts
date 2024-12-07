import { Client, Message, TextChannel, time } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import config from "../../../config";
import CountingGame from "../../../models/CountingGame";

const isNumeric = (str: string) => {
  const num = parseFloat(str);
  return !isNaN(num) && isFinite(num);
};

const event: DiscordEventInterface = async (client: Client, msg: Message) => {
  if (msg.channelId != config.modules.countingGame.channelSet) return;
  if (msg.author.bot) return;
  if (!isNumeric(msg.content)) return;

  try {
    const data = await CountingGame.findOne({
      guildId: msg.guildId
    });

    if (data) {
      if (data.latestUserId === msg.author.id)
        throw {
          message: `❌ | ${msg.author}, you are only allowed to count once in a row.`,
        };

      if (msg.content !== data.countingCurrent.toString())
        throw {
          message: `❌ | ${msg.author}, you counted wrong! Check the message history and count with the correct number.`,
        };

      data.countingCurrent += 1;
      data.latestUserId = msg.author.id;
      data.latestMessageId = msg.id;

      await data.save();
      msg.react("✅");
    } else {
      if (msg.content != config.modules.countingGame.numberStart.toString())
        throw {
        message: `❌ | ${msg.author}, you counted wrong! Check the message history and count with the correct number.`,
      }

      const newData = new CountingGame({
        guildId: msg.guildId,
        channelId: msg.channelId,
        countingCurrent: config.modules.countingGame.numberStart + 1,
        latestUserId: msg.author.id,
        latestMessageId: msg.id,
      });

      await newData.save();
      msg.react("✅");
    }
  } catch (error: { name: string; message: string } | any) {
    await msg.delete();
    const reply = await (msg.channel as TextChannel).send(`> ${error.message}`);
    setTimeout(() => reply.delete(), 10000);
  }
};

export default event;
