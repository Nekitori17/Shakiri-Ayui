import { MessageFlags } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { musicPlayerStoreSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue || queue.tracks.size === 0)
        throw {
          name: "NoQueue",
          message: "There is no queue to resume",
        };

      musicPlayerStoreSession.shuffeld.set(
        interaction.guildId!,
        ((musicPlayerStoreSession.shuffeld.get(
          interaction.guildId!
        ) as number) || 0) + 1
      );
      queue.tracks.shuffle();
      interaction.editReply("🔀 Queue shuffled!");
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
