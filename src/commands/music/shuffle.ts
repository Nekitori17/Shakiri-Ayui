import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists or it's empty, throw an error
      if (!queue || queue.tracks.size === 0)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to shuffle",
        });
      // Shuffle the tracks in the queue
      queue.tracks.shuffle();

      // Update the shuffle count in the session store
      const voiceStoreSession = new VoiceStoreSession(
        interaction.guildId!
      );
      voiceStoreSession.addShuffledTimes();

      // Edit the deferred reply with an embed confirming the queue has been shuffled
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
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "sf",
  name: "shuffle",
  description: "Let's shake the queue",
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
