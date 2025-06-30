import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      
      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw an error
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to stop",
        };
      // Delete the queue, stopping playback and clearing all tracks
      queue.delete();
      // Clear session data related to the music player for this guild
      musicPlayerStoreSession.shuffled.del(queue.guild.id);
      musicPlayerStoreSession.loop.del(queue.guild.id);
      musicPlayerStoreSession.volume.del(queue.guild.id);
      // Edit the deferred reply with an embed confirming the queue has been stopped
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            // Set the author of the embed with a message and icon
            .setAuthor({
              name: "🎶 Queue has been stopped!",
              iconURL: "https://img.icons8.com/color/512/do-not-disturb.png",
            })
            .setColor("#ff3131"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  alias: "st",
  name: "stop",
  description: "Stop queue now",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: true,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
