import config from "../../../config";
import { Message } from "discord.js";
import CountingGame from "../../../models/CountingGame";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const isNumeric = (str: string) => {
  const num = parseFloat(str);
  return !isNaN(num) && isFinite(num);
};

const event: DiscordEventInterface = async (client, msg: Message) => {
  if (msg.author.bot) return;
  if (!isNumeric(msg.content)) return;

  const settings = await config.modules(msg.guildId!);
  if (!settings.countingGame.enabled) return;
  if (msg.channelId != settings.countingGame.channelSet) return;

  try {
    const data = await CountingGame.findOne({
      guildId: msg.guildId,
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
      if (msg.content != settings.countingGame?.startNumber.toString())
        throw {
          message: `❌ | ${msg.author}, you counted wrong! Check the message history and count with the correct number.`,
        };

      const newData = new CountingGame({
        guildId: msg.guildId,
        channelId: msg.channelId,
        countingCurrent: settings.countingGame?.startNumber + 1,
        latestUserId: msg.author.id,
        latestMessageId: msg.id,
      });

      await newData.save();
      msg.react("✅");
    }
  } catch (error: { name: string; message: string } | any) {
    await msg.delete();
    const reply = msg.channel.isSendable()
      ? await msg.channel.send(`> ${error.message}`)
      : null;
    setTimeout(() => reply?.delete(), 10000);
  }
};

export default event;
