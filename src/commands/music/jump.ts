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
          message: "There is no queue to skip",
        };

      queue.node.skipTo(index + 1);
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶Skipped to track at ${index}`,
              iconURL: "https://img.icons8.com/color/512/last.png",
            })
            .setColor("#73ff00"),
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
  name: "jump",
  description: "Jump to a specific song",
  deleted: false,
  options: [
    {
      name: "index",
      description: "The position to jump to",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
