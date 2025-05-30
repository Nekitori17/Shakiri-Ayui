import axios from "axios";
import {
  ApplicationCommandType,
  MessageContextMenuCommandInteraction,
  MessageFlags,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import UserSettings from "../../models/UserSettings";
import { ContextInterface } from "../../types/InteractionInterfaces";

const context: ContextInterface = {
  async execute(interaction: MessageContextMenuCommandInteraction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    try {
      const targetMessage = interaction.targetMessage;
      const userSettings = await UserSettings.findOne({
        userId: interaction.user.id,
      });

      const translated = await axios
        .post(
          `${process.env.CUSTOM_URL_API_BASE}/endpoint`,
          {
            input: targetMessage.content,
            lang: userSettings?.messageTranslateLang || "en",
          },
          {
            params: {
              q: "google-translate",
            },
          }
        )
        .then((res) => res.data)
        .catch((err) => {
          throw {
            name: err.response.statusText,
            message: err.response.data.error,
          };
        });

      interaction.editReply(translated.result);
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "Translate the message",
  shortName: "translate",
  type: ApplicationCommandType.Message,
  deleted: false,
};

export default context;
