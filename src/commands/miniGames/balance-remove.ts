import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import MiniGameUserDatas from "../../models/MiniGameUserDatas";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const userTarget = interaction.options.get("user")?.value as string;
    const amount = interaction.options.get("amount")?.value as number;

    try {
      if (amount <= 0) {
        throw {
          name: "InvalidAmount",
          message: "You cannot remove a negative or zero amount.",
          type: "warning",
        };
      }

      const userMiniGameDatas = await MiniGameUserDatas.findOne({
        userId: interaction.user.id,
      });

      if (!senderData)
        throw {
          name: "NoAccount",
          message:
            "You don't have an account yet. Please use the daily command to create one.",
        };

      userMiniGameDatas.balance -= amount;
      await userMiniGameDatas.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Balance Removed!",
            description: `Successfully removed **${amount}** <:nyen:1373967798790783016> from <@${userTarget}>'s balance.`,
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
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
