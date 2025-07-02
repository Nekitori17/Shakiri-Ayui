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
      const targetUserOption = interaction.options.getUser("user", true);
      const amountOption = interaction.options.getInteger("amount", true);

      // Check if the user is a bot
      if (targetUserOption.bot)
        throw new CustomError({
          name: "BotUser",
          message: "Bro think they can play mini game 💀🙏",
          type: "warning",
        });

      // Check is invalid value
      if (amountOption <= 0) 
        throw {
          name: "InvalidAmount",
          message: "You cannot remove a negative or zero amount.",
          type: "warning",
        };
      

      // Get mini game data of user
      const miniGameUserData = await MiniGameUserData.findOne({
        userId: targetUserOption.id,
      });

      // If user does not have an account
      if (!miniGameUserData)
        throw new CustomError({
          name: "NoAccount",
          message:
            "You don't have an account yet. Please use the daily command to create one.",
        });

      // Check if the user has enough balance
      if (miniGameUserData.balance < amountOption)
        throw new CustomError({
          name: "InsufficientBalance",
          message: "The user does not have enough balance to remove.",
        });

      // Update balance
      miniGameUserData.balance -= amountOption;
      await miniGameUserData.save();

      // Send success message
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Balance Removed!",
            description:
              `Successfully removed **${amountOption}** <:nyen:1373967798790783016> from ${targetUserOption}'s balance.` +
              "\n\n" +
              `**${targetUserOption}'s New Balance:** ${miniGameUserData.balance}`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "balance-remove",
  description: "Remove balance from a user",
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
