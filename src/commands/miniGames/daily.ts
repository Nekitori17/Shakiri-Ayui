import { EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const userDatas = await MiniGameUserDatas.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: interaction.user.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      const COIN_REWARD = 50;
      const DAILY_STREAK_MULTIPLIER = 0.1;

      const multiplier = 1 + DAILY_STREAK_MULTIPLIER * userDatas.dailyStreak;
      const actualRewardGained = Math.round(COIN_REWARD * multiplier);
      const newBalance = userDatas.balance + actualRewardGained;
      userDatas.balance = newBalance;
      userDatas.dailyStreak += 1;
      if (userDatas.dailyStreak > userDatas.longestStreak)
        userDatas.longestStreak = userDatas.dailyStreak;
      userDatas.lastDaily = new Date(Date.now());

      await userDatas.save();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Daily Reward",
              iconURL: "https://img.icons8.com/fluency/512/today.png",
            })
            .setTitle(
              `> <:colorgift:1387275742798287051> Daily Reward Claimed!`
            )
            .setDescription(
              `* <:colorwallet:1387275109844389928> **Your New Balance**: ${newBalance.toLocaleString()} <:nyen:1373967798790783016> (+ ${actualRewardGained.toLocaleString()} <:nyen:1373967798790783016>)` +
                "\n" +
                `* <:colorpositivedynamic:1387276176900358164> **Multiplier**: ${multiplier.toFixed(
                  1
                )}x` +
                "\n" +
                `* <:colorfire:1387269037830049994> **Daily Streak**: ${userDatas.dailyStreak} days` +
                "\n" +
                `* <:colorcampfire:1387274928981676165> **Longest Streak**: ${userDatas.longestStreak} days`
            )
            .setColor("Aqua")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/6j940t.gif",
            })
            .setTimestamp(),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "daily",
  description: "Claims your daily reward",
  deleted: false,
  cooldown: 86400,
  canUseInDm: true,
};

export default command;
