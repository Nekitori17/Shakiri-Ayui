import {
  Client,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { useQueue } from "discord-player";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guild?.id!);
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to pause",
        };

      queue.node.setPaused(true);
      interaction.deleteReply()
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
  name: "pause",
  description: "Pause the current song",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
