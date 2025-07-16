import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue, QueueRepeatMode } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { MusicPlayerSession } from "../../musicPlayerStoreSession";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the repeat mode option from the interaction
      const repeatModeOption = interaction.options.getInteger(
        "mode",
        true
      ) as QueueRepeatMode;
      // Get the human-readable name for the repeat mode
      const repeatModeName =
        repeatModeNames[repeatModeOption as keyof typeof repeatModeNames];

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw an error
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to loop",
        });

      // Set the repeat mode for the queue
      queue.setRepeatMode(repeatModeOption);
      // Update the loop mode in the music player session
      const musicPlayerStoreSession = new MusicPlayerSession(
        interaction.guildId!
      );
      musicPlayerStoreSession.setRepeatMode(repeatModeOption);
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
      handleInteractionError(interaction, error);

      return false;
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
