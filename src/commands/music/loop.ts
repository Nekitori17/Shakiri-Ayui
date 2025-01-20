import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue, QueueRepeatMode } from "discord-player";
import { sendError } from "../../utils/sendError";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const repeatMode = interaction.options.get("mode")
      ?.value as QueueRepeatMode;
    const repeatModeName =
      repeatModeNames[repeatMode as keyof typeof repeatModeNames];

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "No Queue",
          message: "There is no queue to loop",
        };

      queue.setRepeatMode(repeatMode);
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Set loop mode to ${repeatModeName}`,
              iconURL: "https://img.icons8.com/fluency/512/repeat.png",
            })
            .setColor("#5a01ff"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "loop",
  description: "Set the loop mode",
  options: [
    {
      name: "mode",
      description: "Loop mode",
      type: ApplicationCommandOptionType.Number,
      required: true,
      choices: [
        {
          name: "Off",
          value: "0",
        },
        {
          name: "Track",
          value: "1",
        },
        {
          name: "Queue",
          value: "2",
        },
        {
          name: "Autoplay",
          value: "3",
        },
      ],
    },
  ],
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
