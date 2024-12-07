import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { useQueue } from "discord-player";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const level = interaction.options.get("level")?.value as number;

    try {
      const queue = useQueue(interaction.guild?.id!);
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to skip",
        };

      queue.node.setVolume(level);
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Volume set to ${level}!`,
              iconURL: "https://img.icons8.com/color/512/low-volume.png",
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
  name: "volume",
  description: "Change volume of bot",
  options: [
    {
      name: "level",
      description: "Level of volume",
      type: ApplicationCommandOptionType.Number,
      required: true
    }
  ],
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
