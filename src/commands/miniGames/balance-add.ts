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
        throw new CustomError({
          name: "InvalidAmount",
          message: "You cannot add a negative or zero amount.",
          type: "warning",
        });
      

      // Get mini game data of user
      const miniGameUserData = await MiniGameUserData.findOneAndUpdate(
        {
          userId: targetUserOption.id,
        },
        {
          $setOnInsert: {
            userId: targetUserOption.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      // Update balance
      miniGameUserData.balance += amountOption;
      await miniGameUserData.save();

      // Send success message
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Balance Added!",
            description:
              `Successfully added **${amountOption}** <:nyen:1373967798790783016> to ${targetUserOption}'s balance.` +
              "\n\n" +
              `**${targetUserOption}'s New Balance:** ${miniGameUserData.balance}`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "balance-add",
  description: "Adds balance to a user",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "user",
      description: "The user to add balance to",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "amount",
      description: "The amount to add",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
