import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue || queue.tracks.size === 0)
        throw {
          name: "NoQueue",
          message: "There is no queue to shuffle",
        };

      queue.tracks.shuffle();
      musicPlayerStoreSession.shuffeld.set(
        interaction.guildId!,
        ((musicPlayerStoreSession.shuffeld.get(
          interaction.guildId!
        ) as number) || 0) + 1
      );
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
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "shuffle",
  description: "Let's shake the queue or not",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
