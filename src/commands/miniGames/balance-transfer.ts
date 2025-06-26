import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const sender = interaction.options.get("sender")?.value as string;
    const receiver = interaction.options.get("receiver")?.value as string;
    const amount = interaction.options.get("amount")?.value as number;

    try {
      if (sender === receiver)
        throw {
          name: "Invalid user",
          message: "You cannot transfer balance to yourself.",
        };

      if (amount <= 0)
        throw {
          name: "InvalidAmount",
          message: "Amount must be greater than 0.",
        };

      const senderData = await MiniGameUserDatas.findOne({
        userId: sender,
      });
      const receiverData = await MiniGameUserDatas.findOne({
        userId: receiver,
      });

      if (!senderData)
        throw {
          name: "UserNotFound",
          message: `<@${sender}> does not have a balance yet.`,
        };

      if (!receiverData)
        throw {
          name: "UserNotFound",
          message: `<@${receiver}> does not have a balance yet.`,
        };

      if (senderData.balance < amount)
        throw {
          name: "InsufficientBalance",
          message: `<@${sender}> does not have enough balance to transfer.`,
        };

      senderData.balance -= amount;
      receiverData.balance += amount;

      await senderData.save();
      await receiverData.save();

      const [senderUser, receiverUser] = await Promise.all([
        client.users.fetch(sender),
        client.users.fetch(receiver),
      ]);

      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Balance Transfer Successful",
            description: `> Successfully transferred **${amount}** <:nyen:1373967798790783016> from **${senderUser.username}** to **${receiverUser.username}**.`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "balance-transfer",
  description: "Transfer balance from a user to another user",
  deleted: false,
  options: [
    {
      name: "sender",
      description: "The user who will send the balance",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "receiver",
      description: "The user who will receive the balance",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "amount",
      description: "The amount to transfer",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
