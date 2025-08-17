import config from "../../../config";
import { Message } from "discord.js";
import { FnUtils } from "../../../helpers/FnUtils";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import CountingGame from "../../../models/CountingGame";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  // Ignore non-numeric messages
  if (!FnUtils.isNumber(message.content)) return;

  // Fetch guild settings for the counting game
  const guildSetting = await config.modules(message.guildId!);
  if (!guildSetting.countingGame.enabled) return;
  if (message.channelId != guildSetting.countingGame.channelSet) return;

  try {
    // Query for the guild's counting game data
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
        new: true,
      }
    );

    // Check if the same user is counting consecutively
    if (guildCountingGameData.latestUserId === message.author.id)
      throw {
        message: `❌ | ${message.author}, you are only allowed to count once in a row.`,
      };

    // Check if the counted number is correct
    if (message.content !== guildCountingGameData.countingCurrent.toString())
      throw {
        message: `❌ | ${message.author}, you counted wrong! Check the message history and count with the correct number.`,
      };

    // Increment the count and update latest user/message
    guildCountingGameData.countingCurrent += 1;
    guildCountingGameData.latestUserId = message.author.id;
    guildCountingGameData.latestMessageId = message.id;

    // Save the updated game data and react with success
    await guildCountingGameData.save();
    message.react("✅");
  } catch (error: any) {
    if (error instanceof Error) {
      message.reply({
        embeds: [
          CommonEmbedBuilder.error({
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
