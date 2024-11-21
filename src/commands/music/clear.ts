import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
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
          message: "There is no queue to clear",
        };

      queue.tracks.clear();
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 Queue has been cleared!",
              iconURL: "https://img.icons8.com/fluency/512/filled-trash.png",
            })
            .setColor("#ff3131"),
        ],
      });
    } catch (error: { name: string; message: string } | any) {
      await interaction.deleteReply();
      (interaction.channel as TextChannel)?.send({
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
    }
  },
  name: "clear",
  description: "Clear the queue",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
