import { useQueue } from "discord-player";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // Check if a queue exists
      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to resume",
        });

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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
