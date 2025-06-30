import { Message } from "discord.js";
import CountingGame from "../../../models/CountingGame";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, msg: Message) => {
  // Ignore messages from bots to prevent infinite loops or unintended behavior
  if (msg.author.bot) return;

  try {
    // Find the counting game data for the guild where the message was deleted
    const guildCountingGameData = await CountingGame.findOne({
      guildId: msg.guildId,
    });

    // If no counting game data exists for this guild, do nothing
    if (!guildCountingGameData) return;

    // Check if the deleted message was the latest message in the counting game
    if (guildCountingGameData.latestMessageId === msg.id) {
      // If it was, decrement the current count
      guildCountingGameData.countingCurrent -= 1;
      // Save the updated counting game data
      await guildCountingGameData.save();
    }
  } catch (error: any) {
    await msg.delete();
    if (msg.channel.isSendable())
      msg.channel.send({
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
