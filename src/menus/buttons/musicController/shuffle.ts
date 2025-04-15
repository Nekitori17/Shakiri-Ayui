import { useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";
import { MessageFlags } from "discord.js";

const button: ButtonInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to resume",
        };

      queue.tracks.shuffle();
      interaction.editReply("🔀 Queue shuffled!");
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
