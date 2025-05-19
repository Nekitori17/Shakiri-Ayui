import { ApplicationCommandOptionType } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import UserSettings from "../../models/UserSettings";
import { translateLanguages } from "../../constants/translateLanguages";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const language = interaction.options.get("lang")
      ?.value as keyof typeof translateLanguages;

    try {
      if (!Object.keys(translateLanguages).includes(language))
        throw {
          name: "LanguageNotFound",
          message: "Please enter a valid language (Ex: en, vi, ja,...)",
        };

      const userSettings = await UserSettings.findOneAndUpdate(
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

      userSettings.messageTranslateLang = language;
      await userSettings.save();

      interaction.editReply(
        `> <:update:1309527728999104622> You have set your translate language to \`${translateLanguages[language]}\``
      );
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "translate-set",
  description: "Set translate language",
  deleted: false,
  canUseInDm: true,
  options: [
    {
      name: "lang",
      description: "Language to translate (ex: en, vi, ja,...)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export default command;
