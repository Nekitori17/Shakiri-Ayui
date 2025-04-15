import { useHistory } from "discord-player";
import { ButtonInterface } from "../../../types/InteractionInterfaces";
import sendError from "../../../helpers/sendError";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      const history = useHistory(interaction.guildId!);
      if (!history)
        throw {
          name: "NoQueue",
          message: "There is no queue to play",
        };

      await history.previous();
      interaction.deferUpdate();
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
