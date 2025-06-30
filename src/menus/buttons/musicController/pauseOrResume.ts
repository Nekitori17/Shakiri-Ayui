import { useQueue } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to resume",
        };

      // Check if the queue is currently paused
      if (queue.node.isPaused()) {
        // If paused, resume the queue
        queue.node.resume();
        interaction.deferUpdate();
      } else {
        // If not paused, pause the queue
        queue.node.pause();
        interaction.deferUpdate();
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
