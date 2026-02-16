import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue, QueueRepeatMode } from "discord-player";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const repeatModeOption = interaction.options.getInteger(
        "mode",
        true,
      ) as QueueRepeatMode;
      const repeatModeName =
        repeatModeNames[repeatModeOption as keyof typeof repeatModeNames];

      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to loop",
        });

      queue.setRepeatMode(repeatModeOption);
      const voiceStoreSession = new VoiceStoreSession(interaction.guildId!);
      voiceStoreSession.setRepeatMode(repeatModeOption);
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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "loop",
  description: "Set the loop mode",
  disabled: false,
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
