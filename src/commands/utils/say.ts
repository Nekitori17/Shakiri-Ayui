import { useMainPlayer } from "discord-player";
import { GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import { CommandInterface } from "./../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const message = interaction.options.getString("message");

      const player = useMainPlayer();

      await player.play(
        (interaction.member as GuildMember).voice.channel!,
        `tts:${message}`,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
              doNotLog: true,
            },
            volume: 100,
            leaveOnEmpty: false,
            leaveOnEnd: false,
          },
        },
      );

      await interaction.editReply(`Successfully said: **${message}**`);

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);
      return false;
    }
  },
  alias: ["s"],
  name: "say",
  description: "Says what you want it to say.",
  disabled: false,
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
