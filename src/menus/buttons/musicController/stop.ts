import { useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { musicPlayerStoreSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to stop",
        };

      queue.delete();
      musicPlayerStoreSession.shuffeld.del(queue.guild.id);
      musicPlayerStoreSession.loop.del(queue.guild.id);
      musicPlayerStoreSession.volume.del(queue.guild.id);
      interaction.deferUpdate();
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
