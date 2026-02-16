import { MessageFlags } from "discord.js";
import { useQueue } from "discord-player";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes(
      client.constants.CONTROL_PANEL_TAG,
    );

    try {
      await interaction.deferReply({
        flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
      });

      const queue = useQueue(interaction.guildId!);

      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to show",
        });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: true,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
