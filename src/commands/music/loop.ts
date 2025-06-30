import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue, QueueRepeatMode } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const repeatModeOption = interaction.options.getInteger(
        "mode",
        true
      ) as QueueRepeatMode;
      const repeatModeName =
        repeatModeNames[repeatModeOption as keyof typeof repeatModeNames];

      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to loop",
        };

      queue.setRepeatMode(repeatModeOption);
      musicPlayerStoreSession.loop.set(interaction.guildId!, repeatModeOption);
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
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "mode",
      description: "Loop mode",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      choices: [
        {
          name: "Off",
          value: 0,
        },
        {
          name: "Track",
          value: 1,
        },
        {
          name: "Queue",
          value: 2,
        },
        {
          name: "Autoplay",
          value: 3,
        },
      ],
    },
  ],
  useInDm: false,
  requiredVoiceChannel: true,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
