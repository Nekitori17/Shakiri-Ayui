import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const senderUserOption = interaction.options.getUser("sender", true);
      const receiverUserOption = interaction.options.getUser("receiver", true);
      const amountOption = interaction.options.getInteger("amount", true);

      // Check if the user is a bot
      if (senderUserOption.bot || receiverUserOption.bot)
        throw {
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
        };

      // Check if sender and receiver are the same
      if (senderUserOption === receiverUserOption)
        throw {
          name: "Invalid user",
          message: "You cannot transfer balance to same user.",
        };

      // Check if the amount is valid
      if (amountOption <= 0)
        throw {
          name: "InvalidAmount",
          message: "Amount must be greater than 0.",
        };

      // Get sender and receiver data
      const senderUserMiniGameData = await MiniGameUserData.findOne({
        userId: senderUserOption.id,
      });
      const receiverUserMiniGameData = await MiniGameUserData.findOne({
        userId: receiverUserOption.id,
      });

      // Check if sender or receiver has an account.
      if (!senderUserMiniGameData)
        throw {
          name: "UserNotFound",
          message: `${senderUserOption} does not have a balance yet.`,
        };
      if (!receiverUserMiniGameData)
        throw {
          name: "UserNotFound",
          message: `${receiverUserOption.id} does not have a balance yet.`,
        };

      if (senderUserMiniGameData.balance < amountOption)
        throw {
          name: "InsufficientBalance",
          message: `${senderUserOption} does not have enough balance to transfer.`,
        };

      // Update balance
      senderUserMiniGameData.balance -= amountOption;
      receiverUserMiniGameData.balance += amountOption;

      // Save updated data
      await senderUserMiniGameData.save();
      await receiverUserMiniGameData.save();

      // Send success message
      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Balance Transfer Successful",
            description:
              `> Successfully transferred **${amountOption}** <:nyen:1373967798790783016> from **${senderUserOption.username}** to **${receiverUserOption.username}**.` +
              "\n\n" +
              `**${senderUserOption}'s New Balance:** ${senderUserMiniGameData.balance}` +
              "\n" +
              `**${receiverUserOption}'s New Balance:** ${receiverUserMiniGameData.balance}`,
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
  devOnly: false,
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
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
