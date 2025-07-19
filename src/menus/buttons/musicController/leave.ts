import { EmbedBuilder, MessageFlags } from "discord.js";
import { VoiceUtils, useMainPlayer } from "discord-player";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { MusicPlayerSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");
    
    try {
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });
      
      // Get the voice connection for the current guild
      const connection = new VoiceUtils(useMainPlayer()).getConnection(
        interaction.guildId!
      );
      
      // If no connection exists, throw a custom error
      if (!connection)
        throw new CustomError({
          name: "NoConnection",
          message: "I'm not connected to any voice channel",
        });
      
      // Destroy the voice connection
      connection.destroy();
      
      // Clear the music player session data for the guild
      const musicPlayerStoreSession = new MusicPlayerSession(
        interaction.guildId!
      );
      musicPlayerStoreSession.clear();
      
      // Edit the deferred reply with an embed confirming disconnection
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "👋 Disconnected from voice channel",
              iconURL: "https://img.icons8.com/fluency/512/disconnect.png",
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
