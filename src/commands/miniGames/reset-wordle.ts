import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import MiniGameUserData from "../../models/MiniGameUserData";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const userTargetOption = interaction.options.getUser("user", true);

      // Find the user's MiniGameUserData document. If it doesn't exist, create a new one
      const miniGameUserData = await MiniGameUserData.findOneAndUpdate(
        {
          userId: userTargetOption.id,
        },
        {
          $setOnInsert: {
            userId: userTargetOption,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      // Set the wordleGame field to null to reset it
      miniGameUserData.wordleGame = null;

      // Save the updated document
      await miniGameUserData.save();

      // Edit the deferred reply with a success message
      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Wordle Reset",
            description: `Successfully reset Wordle for ${userTargetOption}`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "reset-wordle",
  description: "Resets a user's Wordle",
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
