import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue } from "discord-player";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue();
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to stop",
        };

      queue.delete();
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
    } catch (error: { name: string; message: string } | any) {
      interaction.editReply({
        content: null,
        components: undefined,
        files: undefined,
        attachments: undefined,
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
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
