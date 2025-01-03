import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const index = interaction.options.get("index")?.value as number;

    try {
      const queue = useQueue();
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to stop",
        };

      const track = queue.removeTrack(index - 1);
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Track name: ${track?.title} has been remove!`,
              iconURL: "https://img.icons8.com/fluency/512/filled-trash.png",
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
  name: "remove",
  description: "Remove the track in queue",
  deleted: false,
  options: [
    {
      name: "index",
      description: "Position of the track",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
