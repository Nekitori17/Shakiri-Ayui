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

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to play",
        });

      // Skip the current track
      queue.node.skip();
      // Edit the reply with an embed confirming the skip
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 The track has been skipped!",
              iconURL: "https://img.icons8.com/color/512/last.png",
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
