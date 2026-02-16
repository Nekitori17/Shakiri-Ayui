import { ApplicationCommandOptionType } from "discord.js";
import UserSettings from "../../models/UserSettings";
import { translateLanguages } from "../../constants/translateLanguages";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const languageOption = interaction.options.getString(
        "lang",
        true,
      ) as keyof typeof translateLanguages;

      if (!Object.keys(translateLanguages).includes(languageOption))
        throw new client.CustomError({
          name: "LanguageNotFound",
          message: "Please enter a valid language (Ex: en, vi, ja,...)",
        });

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
          returnDocument: "after",
        },
      );

      userSetting.messageTranslateLang = languageOption;
      await userSetting.save();

      interaction.editReply(
        `> <:colorwrench:1387287084099833977> You have set your translate language to \`${translateLanguages[languageOption]}\``,
      );

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "translate-set",
  description: "Set translate language",
  disabled: false,
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
