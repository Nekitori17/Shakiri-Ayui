import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import MiniGameUserData from "../../models/UserMiniGameData";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("user", true);
      const amountOption = interaction.options.getInteger("amount", true);

      if (targetUserOption.bot)
        throw new client.CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      if (amountOption <= 0)
        throw new client.CustomError({
          name: "InvalidAmount",
          message: "You cannot remove a negative or zero amount.",
          type: "warning",
        });

      const miniGameUserData = await MiniGameUserData.findOne({
        userId: targetUserOption.id,
      });

      if (!miniGameUserData)
        throw new client.CustomError({
          name: "NoAccount",
          message: "They don't have an account yet.",
        });

      if (miniGameUserData.balance < amountOption)
        throw new client.CustomError({
          name: "InsufficientBalance",
          message: "The user does not have enough balance to remove.",
        });

      miniGameUserData.balance -= amountOption;
      await miniGameUserData.save();

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: "Balance Removed!",
            description:
              `Successfully removed **${amountOption}** <:nyen:1373967798790783016> from ${targetUserOption}'s balance.` +
              "\n\n" +
              `**${targetUserOption}'s New Balance:** ${miniGameUserData.balance}`,
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "balance-remove",
  description: "Remove balance from a user",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "user",
      description: "The user to remove balance from",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "amount",
      description: "The amount to remove from the user's balance",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
