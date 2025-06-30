import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const amountOption = interaction.options.getInteger("amount",true);

      // Check the value is valid
      if (amountOption <= 0) {
        throw {
          name: "InvalidAmount",
          message: "You cannot withdraw a negative or zero amount.",
          type: "warning",
        };
      }

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

      // Check if the user has enough balance in the bank
      if (miniGameUserData.bank.balance < amountOption) {
        throw {
          name: "InsufficientBankBalance",
          message: "You don't have enough coins in your bank to withdraw.",
          type: "warning",
        };
      }

      // Update balance and bank balance
      miniGameUserData.balance += amountOption;
      miniGameUserData.bank.balance -= amountOption;
      await miniGameUserData.save();

      // Send success message
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `> <:colorwithdraw:1387340003373223977> ${interaction.user.displayName}'s Withdrawal`
            )
            .setDescription(
              `* <:colorcoin:1387339346889281596> **Amount**: ${amountOption} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **New Balance**: ${miniGameUserData.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorbank:1387275317076562000> **New Bank Balance**: ${miniGameUserData.bank.balance}/${miniGameUserData.bank.capacity} <:nyen:1373967798790783016>`
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
  name: "withdraw",
  description: "Withdraw coins from your bank.",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "amount",
      description: "The amount of coins you want to withdraw.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  cooldown: 3600,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
