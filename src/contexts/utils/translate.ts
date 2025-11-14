import { ApplicationCommandType, MessageFlags } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
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

      // Make a POST request to the translation API endpoint using built-in fetch.
      const messageTranslated = await fetch(
        `${process.env.CUSTOM_URL_API_BASE}/endpoint?q=google-translate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: targetMessage.content,
            lang: userSetting?.messageTranslateLang || "en",
          }),
        }
      ).then((res) => {
        if (!res.ok)
          throw new CustomError({
            name: "Fetch Error",
            message: `Fetch error: ${res.status} ${res.statusText}`,
          });

        return res.json();
      });

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
