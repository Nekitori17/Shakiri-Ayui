import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import { sendError } from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const level = interaction.options.get("level")?.value as number;

    try {
      const queue = useQueue(interaction.guildId!);
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
    } catch (error) {
      sendError(interaction, error)
    }
  },
  name: "volume",
  description: "Change volume of bot",
  options: [
    {
      name: "level",
      description: "Level of volume",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
