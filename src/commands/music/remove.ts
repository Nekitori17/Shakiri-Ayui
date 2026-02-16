import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const indexOption = interaction.options.getInteger("index", true);

      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to remove",
        });

      if (indexOption < 0 || indexOption > queue.tracks.size)
        throw new client.CustomError({
          name: "InvalidIndex",
          message: "Invalid index provided",
          type: "warning",
        });

      const track = queue.removeTrack(indexOption - 1);

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
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "remove",
  description: "Remove the track in queue",
  disabled: false,
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
