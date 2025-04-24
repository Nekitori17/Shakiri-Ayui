import { useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to resume",
        };

      if (queue.node.isPaused()) {
        queue.node.resume();
        interaction.deferUpdate();
      } else {
        queue.node.pause();
        interaction.deferUpdate();
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
