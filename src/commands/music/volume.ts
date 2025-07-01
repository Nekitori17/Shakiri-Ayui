import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { MusicPlayerSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const levelOption = interaction.options.getInteger("level", true);

      if (levelOption < 0)
        throw {
          name: "InvalidVolume",
          message: "Volume cannot be less than 0",
          type: "warning",
        };

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw an error
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to set volume",
        };

      // Set the volume of the queue's node
      queue.node.setVolume(levelOption);
      // Store the new volume level in the music player session
      const musicPlayerStoreSession = new MusicPlayerSession(
        interaction.guildId!
      );
      musicPlayerStoreSession.setVolume(levelOption);

      // Edit the deferred reply with an embed confirming the volume change
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            // Set the author of the embed with a message and icon
            .setAuthor({
              name: `🎶 Volume set to ${levelOption}!`,
              iconURL: "https://img.icons8.com/color/512/low-volume.png",
            })
            // Set the color of the embed
            .setColor("#73ff00"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
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
