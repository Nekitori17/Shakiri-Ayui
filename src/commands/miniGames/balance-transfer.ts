import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
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
        throw new CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      // Check if sender and receiver are the same
      if (senderUserOption === receiverUserOption)
        throw new CustomError({
          name: "InvalidUser",
          message: "You cannot transfer balance to same user.",
          type: "warning",
        });

      // Check if the amount is valid
      if (amountOption <= 0)
        throw new CustomError({
          name: "InvalidAmount",
          message: "Amount must be greater than 0.",
          type: "warning",
        });

      // Get sender and receiver data
      const senderUserMiniGameData = await MiniGameUserData.findOne({
        userId: senderUserOption.id,
      });
      const receiverUserMiniGameData = await MiniGameUserData.findOne({
        userId: receiverUserOption.id,
      });

      // Check if sender or receiver has an account.
      if (!senderUserMiniGameData)
        throw new CustomError({
          name: "NoAccoun",
          message: `${senderUserOption} does not have a balance yet.`,
        });
      if (!receiverUserMiniGameData)
        throw new CustomError({
          name: "NoAccount",
          message: `${receiverUserOption.id} does not have a balance yet.`,
        });

      if (senderUserMiniGameData.balance < amountOption)
        throw new CustomError({
          name: "InsufficientBalance",
          message: `${senderUserOption} does not have enough balance to transfer.`,
        });

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
