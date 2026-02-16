import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const queue = useQueue(interaction.guildId!);
      if (!queue || queue.tracks.size === 0)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to shuffle",
        });
      queue.tracks.shuffle();

      const voiceStoreSession = new VoiceStoreSession(interaction.guildId!);
      voiceStoreSession.addShuffledTimes();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 Shake, shake, shake. Now it's random!",
              iconURL: "https://img.icons8.com/fluency/512/shuffle.png",
            })
            .setColor("#a6ff00"),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["sf"],
  name: "shuffle",
  description: "Let's shake the queue",
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
