import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const levelOption = interaction.options.getInteger("level", true);

      if (levelOption < 0)
        throw new CustomError({
          name: "InvalidVolume",
          message: "Volume cannot be less than 0",
          type: "warning",
        });

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw an error
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to set volume",
        });

      // Set the volume of the queue's node
      queue.node.setVolume(levelOption);
      // Store the new volume level in the music player session
      const voiceStoreSession = new VoiceStoreSession(
        interaction.guildId!
      );
      voiceStoreSession.setVolume(levelOption);

      // Edit the deferred reply with an embed confirming the volume change
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Volume set to ${levelOption}!`,
              iconURL: "https://img.icons8.com/color/512/low-volume.png",
            })
            .setColor("#73ff00"),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "v",
  name: "volume",
  description: "Change volume of bot",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "level",
      description: "Level of volume",
      type: ApplicationCommandOptionType.Integer,
      required: true,
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
