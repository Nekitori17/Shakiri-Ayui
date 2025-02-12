import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to skip",
        };

      queue.node.skip();
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 The track has been skipped!",
              iconURL: "https://img.icons8.com/color/512/last.png",
            })
            .setColor("#73ff00"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "skip",
  description: "Skip the current song",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
