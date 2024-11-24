import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import { CommandInterface } from "./../../types/InteractionInterfaces";
import { translateLanguages } from "../../data/translateLanguages";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import TranslateMessage from "../../models/TranslateMessage";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const language = interaction.options.get("lang")?.value as keyof typeof translateLanguages;

    try {
      if (!Object.keys(translateLanguages).includes(language)) throw {
        name: "Language Not Found",
        message: "Please enter a valid language (Ex: en, vi, ja,...)",
      }

      const query = {
        userId: interaction.user.id,
      };

      const data = await TranslateMessage.findOne(query);

      if (data) {
        data.language = language;

        await data.save();
        interaction.editReply(
          `> <:update:1309527728999104622> You have set your translate language to \`${translateLanguages[language]}\``
        );
      } else {
        const newData = new TranslateMessage({
          userId: interaction.user.id,
          language,
        });

        await newData.save();
        interaction.editReply(
          `> <:update:1309527728999104622> You have set your translate language to \`${translateLanguages[language]}\``
        );
      }
    } catch (error: { name: string; message: string } | any) {
      await interaction.deleteReply();
      (interaction.channel as TextChannel)?.send({
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
      description: "Language to translate (Ex: en, vi, ja,...)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export default command;
