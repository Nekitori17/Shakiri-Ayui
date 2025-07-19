import { EmbedBuilder, MessageFlags } from "discord.js";
import { useHistory } from "discord-player";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");

    try {
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });

      // Get the queue history for the current guild
      const queueHistory = useHistory(interaction.guildId!);
      // Check if a queue history exists
      if (!queueHistory)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to play",
        });

      // Play the previous track in the history
      await queueHistory.previous();
      // Edit the reply with an embed confirming the previous track will play
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 The previous will start to play",
              iconURL: "https://img.icons8.com/color/512/first.png",
            })
            .setColor("#73ff00"),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
