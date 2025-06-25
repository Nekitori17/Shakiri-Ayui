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
      const userMiniGameDatas = await MiniGameUserDatas.findOneAndUpdate(
        {
          userId: userTarget,
        },
        {
          $setOnInsert: {
            userId: userTarget,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      userMiniGameDatas.balance += amount;
      await userMiniGameDatas.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Balance Added!",
            description: `Successfully added **${amount}** <:nyen:1373967798790783016> to <@${userTarget}>'s balance.`,
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
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
