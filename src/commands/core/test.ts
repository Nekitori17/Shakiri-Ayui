import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      interaction.deleteReply();
    } catch (error) {
      client.interactionErrorHandler(interaction, error);
      return false;
    }
  },
  name: "test",
  description: "Test command",
  disabled: false,
  deleted: false,
  devOnly: true,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
