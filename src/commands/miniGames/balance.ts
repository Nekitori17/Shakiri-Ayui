import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("user");

      // Check if the user is a bot
      if (targetUserOption && targetUserOption.bot)
        throw new CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      // Get mini game data of user
      const miniGameUserData = await MiniGameUserData.findOneAndUpdate(
        {
          userId: targetUserOption?.id || interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: targetUserOption?.id || interaction.user.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      // Send success message
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `> <:colorcoin:1387339346889281596> ${
                targetUserOption || interaction.user
              }'s Balance`
            )
            .setDescription(
              `* <:colorfire:1387269037830049994> **Daily Streak**: ${miniGameUserData.dailyStreak} days` +
                "\n" +
                `* <:colorcampfire:1387274928981676165> **Longest Streak**: ${miniGameUserData.longestStreak} days` +
                "\n" +
                `* <:colorwallet:1387275109844389928> Balance: ${miniGameUserData.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorbank:1387275317076562000> **Bank**: ${miniGameUserData.bank.balance}/${miniGameUserData.bank.capacity} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:coloreconomicimprovement:1387275487637803039> **Interest Rate**: ${
                  miniGameUserData.bank.interestRate * 100
                }%`
            )
            .setColor("Aqua")
            .setThumbnail(
              targetUserOption?.displayAvatarURL() ||
                interaction.user.displayAvatarURL()
            )
            .setFooter({
              text: client.user?.displayName!,
              iconURL: "https://files.catbox.moe/6j940t.gif",
            })
            .setTimestamp(),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "bl",
  name: "balance",
  description: "Check your balance or someone else's balance",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "user",
      description: "The user to check the balance of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
