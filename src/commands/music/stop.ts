import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to stop",
        };

      queue.delete();
      musicPlayerStoreSession.shuffeld.del(queue.guild.id);
      musicPlayerStoreSession.loop.del(queue.guild.id);
      musicPlayerStoreSession.volume.del(queue.guild.id);
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
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "stop",
  description: "Stop queue now",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
