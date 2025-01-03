import { ApplicationCommandOptionType } from "discord.js";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import UserSettings from "../../models/UserSettings";
import { translateLanguages } from "../../data/translateLanguages";
import { CommandInterface } from "./../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const language = interaction.options.get("lang")
      ?.value as keyof typeof translateLanguages;

    try {
      if (!Object.keys(translateLanguages).includes(language))
        throw {
          name: "Language Not Found",
          message: "Please enter a valid language (Ex: en, vi, ja,...)",
        };

      const data = await UserSettings.findOne({
        userId: interaction.user.id,
      });

      if (data) {
        data.messageTranslateLang = language;

        await data.save();
      } else {
        const newData = new UserSettings({
          userId: interaction.user.id,
          messageTranslateLang: language,
        });

        await newData.save();
      }

      interaction.editReply(
        `> <:update:1309527728999104622> You have set your translate language to \`${translateLanguages[language]}\``
      );
    } catch (error: { name: string; message: string } | any) {
      interaction.editReply({
        content: null,
        components: undefined,
        files: undefined,
        attachments: undefined,
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
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
