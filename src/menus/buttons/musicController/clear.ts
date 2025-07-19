import { EmbedBuilder, MessageFlags } from "discord.js";
import { useQueue } from "discord-player";
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

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw a custom error
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to clear",
        });

      // Clear all tracks from the queue
      queue.tracks.clear();
      // Edit the deferred reply with an embed confirming the queue has been cleared
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 Queue has been cleared!",
              iconURL: "https://img.icons8.com/fluency/512/filled-trash.png",
            })
            .setColor("#ff3131"),
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
