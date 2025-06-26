import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const targetUser = interaction.options.get("target")?.value as string;
    const amount = interaction.options.get("amount")?.value as number;

    try {
      if (amount <= 0)
        throw {
          name: "InvalidAmount",
          message: "You cannot transfer 0 or negative money.",
        };

      const senderData = await MiniGameUserDatas.findOne({
        userId: interaction.user.id,
      });

      if (!senderData)
        throw {
          name: "NoAccount",
          message:
            "You don't have an account yet. Please use the daily command to create one.",
        };

      if (senderData.balance < amount)
        throw {
          name: "InsufficientBalance",
          message: "You don't have enough money to transfer.",
        };

      const targetUserData = await MiniGameUserDatas.findOne({
        userId: targetUser,
      });

      if (!targetUserData)
        throw {
          name: "TargetNoAccount",
          message: "The target user does not have an account yet.",
        };

      senderData.balance -= amount;
      targetUserData.balance += amount;

      await senderData.save();
      await targetUserData.save();

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Transfer Successful")
            .setDescription(
              `* <:colorcoin:1387339346889281596> **Amount**: ${amount} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **Your New Balance**: ${senderData.balance} <:nyen:1373967798790783016>` +
                "\n" +
                `* <:colorwallet:1387275109844389928> **Target's New Balance**: ${targetUserData.balance} <:nyen:1373967798790783016>`
            )
            .setColor("Green"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "transfer",
  description: "Transfer money to another user",
  deleted: false,
  options: [
    {
      name: "target",
      description: "The user to transfer money to",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "amount",
      description: "The amount of money to transfer",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
};

export default command;
