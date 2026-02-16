import { EmbedBuilder } from "discord.js";
import MiniGameUserData from "../../models/UserMiniGameData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const miniGameUserData = await MiniGameUserData.findOneAndUpdate(
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
          returnDocument: "after",
        },
      );

      const COIN_REWARD = 50;
      const DAILY_STREAK_MULTIPLIER = 0.1;

      // Calculate reward based on daily streak
      const multiplier =
        1 + DAILY_STREAK_MULTIPLIER * miniGameUserData.daily.streak;
      const actualRewardGained = Math.round(COIN_REWARD * multiplier);

      const newBalance = miniGameUserData.bank.balance + actualRewardGained;
      miniGameUserData.bank.balance = newBalance;
      miniGameUserData.daily.streak += 1;

      // Update longest streak if current streak is higher
      if (miniGameUserData.daily.streak > miniGameUserData.daily.longestStreak)
        miniGameUserData.daily.longestStreak = miniGameUserData.daily.streak;
      miniGameUserData.daily.lastDaily = new Date(Date.now());

      await miniGameUserData.save();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Daily Reward",
              iconURL: "https://img.icons8.com/fluency/512/today.png",
            })
            .setTitle(
              `> <:colorgift:1387275742798287051> Daily Reward Claimed!`,
            )
            .setDescription(
              `* <:colorwallet:1387275109844389928> **Your New Balance**: ${newBalance.toLocaleString()} <:nyen:1373967798790783016> (+ ${actualRewardGained.toLocaleString()} <:nyen:1373967798790783016>)` +
                "\n" +
                `* <:colorpositivedynamic:1387276176900358164> **Multiplier**: ${multiplier.toFixed(
                  1,
                )}x` +
                "\n" +
                `* <:colorfire:1387269037830049994> **Daily Streak**: ${miniGameUserData.daily.streak} days` +
                "\n" +
                `* <:colorcampfire:1387274928981676165> **Longest Streak**: ${miniGameUserData.daily.longestStreak} days`,
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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["dl"],
  name: "daily",
  description: "Claims your daily reward",
  deleted: false,
  devOnly: false,
  disabled: false,
  cooldown: 86400,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
