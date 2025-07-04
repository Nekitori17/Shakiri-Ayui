import { PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw an error
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to pause",
        });

      // Pause the current track in the queue
      queue.node.setPaused(true);
      // Delete the deferred reply, as the action is immediate and doesn't require a persistent message
      interaction.deleteReply();

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  alias: "ps",
  name: "pause",
  description: "Pause the current song",
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
