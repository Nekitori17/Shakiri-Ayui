import { useMainPlayer } from "discord-player";
import { GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "./../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const message = interaction.options.getString("message");

      // Get the main player instance
      const player = useMainPlayer();

      await player.play(
        (interaction.member as GuildMember).voice.channel!,
        `tts:${message}`,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            volume: 100,
            leaveOnEmpty: false,
            leaveOnEnd: false,
          },
        }
      ); // Edit the reply to confirm the track has been added to the queue

      await interaction.editReply(`Successfully said: **${message}**`);

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);
      return false;
    }
  },
  name: "say",
  description: "Says what you want it to say.",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "message",
      description: "The message to say.",
      type: 3,
      required: true,
    },
  ],
  requiredVoiceChannel: true,
  useInDm: false,
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
  userPermissionsRequired: [PermissionFlagsBits.Connect],
};

export default command;
