import { sendError } from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      throw new Error("Test error");
    } catch (error: { name: string; message: string } | any) {
      sendError(interaction, error);
    }
  },
  name: "error",
  description: "Test error",
  deleted: false,
};

export default command;