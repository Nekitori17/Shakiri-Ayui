import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

// Just a command to test error function
const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      
      throw new Error("Test error");

      return true;
    } catch (error) {
      sendError(interaction, error);
      
      return false;
    }
  },
  name: "error",
  description: "Test error",
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
