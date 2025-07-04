import { EmbedBuilder } from "discord.js";
import { useHistory } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
import { CustomError } from "../../../helpers/utils/CustomError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

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
      sendError(interaction, error);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
