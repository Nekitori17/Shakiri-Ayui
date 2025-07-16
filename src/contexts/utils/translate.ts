import axios from "axios";
import { ApplicationCommandType, MessageFlags } from "discord.js";
import { handleInteractionError } from "../../helpers/utils/handleError";
import UserSettings from "../../models/UserSettings";
import { ContextInterface } from "../../types/InteractionInterfaces";

const context: ContextInterface<ApplicationCommandType.Message> = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Get the target message from the interaction.
      const targetMessage = interaction.targetMessage;

      // Find the user's settings in the database.
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

      // Make a POST request to the translation API endpoint.
      const messageTranslated = await axios
        .post(
          `${process.env.CUSTOM_URL_API_BASE}/endpoint`,
          {
            input: targetMessage.content,
            lang: userSetting?.messageTranslateLang || "en",
          },
          {
            params: {
              q: "google-translate",
            },
          }
        )
        .then((res) => res.data);

      // Edit the deferred reply with the translated message.
      interaction.editReply(messageTranslated.result);

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "Translate this message",
  type: ApplicationCommandType.Message,
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default context;
