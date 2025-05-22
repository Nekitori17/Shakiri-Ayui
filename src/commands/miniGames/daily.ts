import { EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import UserDatas from "../../models/UserDatas";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const userDatas = await UserDatas.findOneAndUpdate(
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

      const mutiplier = 1 + 0.1 * userDatas.dailyStreak;
      const newBalance =
        userDatas.balance + 100 * (1 + 0.1 * userDatas.dailyStreak);
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
            .setTitle(`> 🎁 Daily Reward Claimed!`)
            .setDescription(
              `* You claimed: ${newBalance} <:nyen:1373967798790783016> (+ ${
                100 * mutiplier
              } <:nyen:1373967798790783016>)` +
                "\n" +
                `* Multiplier: ${mutiplier.toFixed(1)}x` +
                "\n" +
                `* Daily Streak: ${userDatas.dailyStreak} days` +
                "\n" +
                `* Longest Streak: ${userDatas.longestStreak} days`
            )
            .setColor("Aqua")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/fw1c0d.gif",
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
