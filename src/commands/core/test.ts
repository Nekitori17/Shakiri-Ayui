import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      interaction.deleteReply();
    } catch (error) {
      handleInteractionError(interaction, error);
      return false;
    }
  },
  name: "test",
  description: "Test command",
  deleted: false,
  devOnly: true,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
