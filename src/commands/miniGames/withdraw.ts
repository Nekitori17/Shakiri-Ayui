import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const amount = interaction.options.get("amount")?.value as number;

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

      if (amount <= 0) {
        throw {
          name: "InvalidAmount",
          message: "You cannot withdraw a negative or zero amount.",
          type: "warning",
        };
      }

      if (userDatas.bank.balance < amount) {
        throw {
          name: "InsufficientBankBalance",
          message: "You don't have enough coins in your bank to withdraw.",
          type: "warning",
        };
      }

      userDatas.balance += amount;
      userDatas.bank.balance -= amount;
      await userDatas.save();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `> <:colorwithdraw:1387340003373223977> ${interaction.user.displayName}'s Withdrawal`
            )
            .setDescription(
              `* <:colorcoin:1387339346889281596> **Amount**: ${amount} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **New Balance**: ${userDatas.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorbank:1387275317076562000> **New Bank Balance**: ${userDatas.bank.balance}/${userDatas.bank.capacity} <:nyen:1373967798790783016>`
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
  options: [
    {
      name: "amount",
      description: "The amount of coins you want to withdraw.",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  canUseInDm: true,
};

export default command;
