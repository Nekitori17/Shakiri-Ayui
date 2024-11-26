import {
  ApplicationCommandType,
  Client,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import axios from "axios";
import { ContextInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import UserSettings from "../../models/UserSettings";

const context: ContextInterface = {
  async execute(
    interaction: MessageContextMenuCommandInteraction,
    client: Client
  ) {
    await interaction.deferReply({ ephemeral: true });
    const targetMessage = interaction.targetMessage;

    try {
      const query = {
        userId: interaction.user.id
      }

      const data = await UserSettings.findOne(query)

      const translated = await axios
        .post(`${process.env.CUSTOM_URL_API_BASE}/endpoint`, {
          input: targetMessage.content,
          lang: data?.messageTranslateLang || "en",
        }, {
          params: {
            q: "google-translate"
          }
        })
        .then((res) => res.data)
        .catch((err) => {
          throw {
            name: err.response.statusText,
            message: err.response.data.error,
          };
        });

        interaction.editReply(translated.result);
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
  name: "Translate the message",
  shortName: "translate",
  type: ApplicationCommandType.Message,
  deleted: false,
};

export default context;
