import { EmbedBuilder } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
import { CustomError } from "../../../helpers/utils/CustomError";
import { MusicPlayerSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists and has tracks
      if (!queue || queue.tracks.size === 0)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to resume",
        });

      // Increment the shuffle count for the guild in the session store
      const musicPlayerStoreSession = new MusicPlayerSession(
        interaction.guildId!
      );
      musicPlayerStoreSession.addShuffledTimes();

      // Shuffle the tracks in the queue
      queue.tracks.shuffle();
      // Edit the reply with an embed confirming the shuffle
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 Shake, shake, shake. Now it's random!",
              iconURL: "https://img.icons8.com/fluency/512/shuffle.png",
            })
            .setColor("#a6ff00"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
