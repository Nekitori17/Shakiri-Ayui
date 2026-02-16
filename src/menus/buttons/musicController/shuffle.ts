import { EmbedBuilder, MessageFlags } from "discord.js";
import { useQueue } from "discord-player";
import { VoiceStoreSession } from "../../../classes/VoiceStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes(
      client.constants.CONTROL_PANEL_TAG,
    );
    
    try {
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists and has tracks
      if (!queue || queue.tracks.size === 0)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to resume",
        });

      // Increment the shuffle count for the guild in the session store
      const voiceStoreSession = new VoiceStoreSession(
        interaction.guildId!
      );
      voiceStoreSession.addShuffledTimes();

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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
