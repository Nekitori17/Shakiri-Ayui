import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import WordleGame from "../../models/miniGames/WordleGame";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const userTargetOption = interaction.options.getUser("user", true);

      await WordleGame.findOneAndDelete({
        userId: userTargetOption.id,
      });

      await interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: "Wordle Reset",
            description: `Successfully reset Wordle for ${userTargetOption}`,
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "reset-wordle",
  description: "Resets a user's Wordle",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "user",
      description: "The user to reset the wordle for",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
