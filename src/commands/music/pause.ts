import { PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import { sendError } from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue();
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to pause",
        };

      queue.node.setPaused(true);
      interaction.deleteReply();
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "pause",
  description: "Pause the current song",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
