import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        // If no queue exists, throw a custom error
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to skip",
        });

      // Skip the current track in the queue
      queue.node.skip();
      // Edit the deferred reply with an embed confirming the track has been skipped
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
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "sk",
  name: "skip",
  description: "Skip the current song",
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
