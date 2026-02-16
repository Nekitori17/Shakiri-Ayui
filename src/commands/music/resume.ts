import { PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const queue = useQueue(interaction.guildId!);

      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to resume",
        });

      queue.node.setPaused(false);
      interaction.deleteReply();

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["rs"],
  name: "resume",
  description: "Play the current song again",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: false,
  requiredVoiceChannel: true,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
