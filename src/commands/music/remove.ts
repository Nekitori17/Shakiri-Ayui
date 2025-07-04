import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const indexOption = interaction.options.getInteger("index", true);

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists, throw an error
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to remove",
        });

      // Validate the provided index
      if (indexOption < 0 || indexOption > queue.tracks.size)
        throw new CustomError({
          name: "InvalidIndex",
          message: "Invalid index provided",
          type: "warning",
        });

      // Remove the track at the specified index from the queue
      const track = queue.removeTrack(indexOption - 1);

      // Edit the deferred reply with an embed confirming the track removal
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

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "remove",
  description: "Remove the track in queue",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "index",
      description: "Position of the track",
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
