import { Message } from "discord.js";
import CountingGame from "../../../models/miniGames/CountingGame";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, message: Message) => {
  if (message.author.bot) return;
  if (!client.utils.FnUtils.isNumber(message.content)) return;

  const guildSetting = await client.getGuildSetting(message.guildId!);
  if (!guildSetting.countingGame.enabled) return;
  if (message.channelId != guildSetting.countingGame.channelSet) return;

  try {
    const guildCountingGameData = await CountingGame.findOneAndUpdate(
      {
        guildId: message.guildId,
      },
      {
        $setOnInsert: {
          guildId: message.guildId,
          countingCurrent: guildSetting.countingGame.startNumber,
          latestUserId: message.author.id,
          latestMessageId: message.id,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    if (guildCountingGameData.latestUserId === message.author.id)
      throw {
        message: `❌ | ${message.author}, you are only allowed to count once in a row.`,
      };

    if (
      message.content !== guildCountingGameData.countingCurrentNumber.toString()
    )
      throw {
        message: `❌ | ${message.author}, you counted wrong! Check the message history and count with the correct number.`,
      };

    guildCountingGameData.countingCurrentNumber += 1;
    guildCountingGameData.latestUserId = message.author.id;
    guildCountingGameData.latestMessageId = message.id;

    await guildCountingGameData.save();
    message.react("✅");
  } catch (error: any) {
    if (error instanceof Error) {
      message.reply({
        embeds: [
          client.CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
    } else {
      await message.delete();
      const reply = message.channel.isSendable()
        ? await message.channel.send(`> ${error.message}`)
        : null;
      setTimeout(() => reply?.delete(), 10000);
    }
  }
};

export default event;
