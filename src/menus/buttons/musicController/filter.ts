import { MessageFlags } from "discord.js";
import { useQueue } from "discord-player";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");

    try {
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });

      const queue = useQueue(interaction.guildId!);

      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to show",
        });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: true,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
