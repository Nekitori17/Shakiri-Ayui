import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to stop",
        });

      queue.delete();
      const voiceStoreSession = new VoiceStoreSession(interaction.guildId!);
      voiceStoreSession.clear();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 Queue has been stopped!",
              iconURL: "https://img.icons8.com/color/512/do-not-disturb.png",
            })
            .setColor("#ff3131"),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["st"],
  name: "stop",
  description: "Stop queue now",
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
