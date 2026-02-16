import { ApplicationCommandType, MessageFlags } from "discord.js";
import UserSettings from "../../models/UserSettings";
import { ContextInterface } from "../../types/InteractionInterfaces";

const context: ContextInterface<ApplicationCommandType.Message> = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const targetMessage = interaction.targetMessage;

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
        },
      ).then((res) => {
        if (!res.ok)
          throw new client.CustomError({
            name: "Fetch Error",
            message: `Fetch error: ${res.status} ${res.statusText}`,
          });

        return res.json();
      });

      interaction.editReply(messageTranslated.result);

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "Translate this message",
  type: ApplicationCommandType.Message,
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
  disabled: false,
};

export default context;
