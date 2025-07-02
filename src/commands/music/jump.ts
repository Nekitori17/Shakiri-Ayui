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
      // If no queue exists, throw a custom error
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to jump",
        });

      // Validate the provided index
      if (indexOption < 0 || indexOption > queue.tracks.size - 1)
        throw new CustomError({
          name: "InvalidIndex",
          message: "Invalid index provided",
          type: "warning",
        });

      // Skip to the track at the specified index in the queue
      queue.node.skipTo(indexOption + 1);
      // Edit the deferred reply with an embed confirming the jump
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 Skipped to track at ${indexOption}`,
              iconURL: "https://img.icons8.com/color/512/last.png",
            })
            .setColor("#73ff00"),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "jump",
  description: "Jump to a specific song",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "index",
      description: "The position to jump to",
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
