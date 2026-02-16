import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue } from "discord-player";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const levelOption = interaction.options.getInteger("level", true);

      if (levelOption < 0)
        throw new client.CustomError({
          name: "InvalidVolume",
          message: "Volume cannot be less than 0",
          type: "warning",
        });

      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to set volume",
        });

      queue.node.setVolume(levelOption);
      const voiceStoreSession = new VoiceStoreSession(interaction.guildId!);
      voiceStoreSession.setVolume(levelOption);

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
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["v"],
  name: "volume",
  description: "Change volume of bot",
  deleted: false,
  devOnly: false,
  disabled: false,
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
