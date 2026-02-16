import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import MiniGameUserData from "../../models/UserMiniGameData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const senderUserOption = interaction.options.getUser("sender", true);
      const receiverUserOption = interaction.options.getUser("receiver", true);
      const amountOption = interaction.options.getInteger("amount", true);

      if (senderUserOption.bot || receiverUserOption.bot)
        throw new client.CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      if (senderUserOption === receiverUserOption)
        throw new client.CustomError({
          name: "InvalidUser",
          message: "You cannot transfer balance to same user.",
          type: "warning",
        });

      if (amountOption <= 0)
        throw new client.CustomError({
          name: "InvalidAmount",
          message: "Amount must be greater than 0.",
          type: "warning",
        });

      const senderUserMiniGameData = await MiniGameUserData.findOne({
        userId: senderUserOption.id,
      });
      const receiverUserMiniGameData = await MiniGameUserData.findOne({
        userId: receiverUserOption.id,
      });

      if (!senderUserMiniGameData)
        throw new client.CustomError({
          name: "NoAccount",
          message: `${senderUserOption} does not have a balance yet.`,
        });
      if (!receiverUserMiniGameData)
        throw new client.CustomError({
          name: "NoAccount",
          message: `${receiverUserOption.id} does not have a balance yet.`,
        });

      if (senderUserMiniGameData.balance < amountOption)
        throw new client.CustomError({
          name: "InsufficientBalance",
          message: `${senderUserOption} does not have enough balance to transfer.`,
        });

      senderUserMiniGameData.balance -= amountOption;
      receiverUserMiniGameData.balance += amountOption;

      await senderUserMiniGameData.save();
      await receiverUserMiniGameData.save();

      await interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "balance-transfer",
  description: "Transfer balance from a user to another user",
  disabled: false,
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
