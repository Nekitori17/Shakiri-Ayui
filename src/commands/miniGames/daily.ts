import { EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Find or create the user's mini-game data
      // Get mini game data of user
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
          new: true,
        }
      );

      // Define reward constants
      const COIN_REWARD = 50;
      const DAILY_STREAK_MULTIPLIER = 0.1;

      // Calculate reward based on daily streak
      const multiplier =
        1 + DAILY_STREAK_MULTIPLIER * miniGameUserData.dailyStreak;
      const actualRewardGained = Math.round(COIN_REWARD * multiplier);

      // Update user's balance and streak
      const newBalance = miniGameUserData.balance + actualRewardGained;
      miniGameUserData.balance = newBalance;
      miniGameUserData.dailyStreak += 1;
      // Update longest streak if current streak is higher
      if (miniGameUserData.dailyStreak > miniGameUserData.longestStreak)
        miniGameUserData.longestStreak = miniGameUserData.dailyStreak;
      miniGameUserData.lastDaily = new Date(Date.now());

      // Save the updated user data to the database
      await miniGameUserData.save();

      // Send success message
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
                `* <:colorfire:1387269037830049994> **Daily Streak**: ${miniGameUserData.dailyStreak} days` +
                "\n" +
                `* <:colorcampfire:1387274928981676165> **Longest Streak**: ${miniGameUserData.longestStreak} days`
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
  alias: "dl",
  name: "daily",
  description: "Claims your daily reward",
  deleted: false,
  devOnly: false,
  cooldown: 86400,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
