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
          message: "You cannot add a negative or zero amount.",
          type: "warning",
        });

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
          returnDocument: "after",
        },
      );

      miniGameUserData.balance += amountOption;
      await miniGameUserData.save();

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: "Balance Added!",
            description:
              `Successfully added **${amountOption}** <:nyen:1373967798790783016> to ${targetUserOption}'s balance.` +
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
  name: "balance-add",
  description: "Adds balance to a user",
  disabled: false,
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
