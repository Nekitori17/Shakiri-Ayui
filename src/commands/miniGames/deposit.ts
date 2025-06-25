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
          message: "You cannot deposit a negative or zero amount.",
          type: "warning",
        };
      }

      if (userDatas.balance < amount) {
        throw {
          name: "InsufficientBalance",
          message: "You don't have enough coins in your balance to deposit.",
          type: "warning",
        };
      }

      if (userDatas.bank.balance + amount > userDatas.bank.capacity) {
        throw {
          name: "BankCapacityExceeded",
          message: `Your bank does not have enough capacity to hold this amount. Your current capacity is ${userDatas.bank.capacity} and you are trying to deposit ${amount}.`,
          type: "warning",
        };
      }

      userDatas.balance -= amount;
      userDatas.bank.balance += amount;
      await userDatas.save();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `> <:colorrequestmoney:1387339020597727313> ${interaction.user.displayName}'s Deposit`
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
  name: "deposit",
  description: "Deposit your coins into the bank.",
  deleted: false,
  options: [
    {
      name: "amount",
      description: "The amount of coins you want to deposit.",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  canUseInDm: true,
};

export default command;
