import { ApplicationCommandOptionType } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import { translateLanguages } from "../../constants/translateLanguages";
import UserSettings from "../../models/UserSettings";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const languageOption = interaction.options.getString(
        "lang",
        true
      ) as keyof typeof translateLanguages;

      // Check if the provided language option is valid
      if (!Object.keys(translateLanguages).includes(languageOption))
        throw new CustomError({
          name: "LanguageNotFound",
          message: "Please enter a valid language (Ex: en, vi, ja,...)",
        });

      // Find the user's settings, or create new settings if they don't exist
      const userSetting = await UserSettings.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: interaction.user.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      // Update the user's translate language setting
      userSetting.messageTranslateLang = languageOption;
      await userSetting.save();

      interaction.editReply(
        // Send a confirmation message to the user
        `> <:colorwrench:1387287084099833977> You have set your translate language to \`${translateLanguages[languageOption]}\``
      );

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "translate-set",
  description: "Set translate language",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "lang",
      description: "Language to translate (ex: en, vi, ja,...)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
