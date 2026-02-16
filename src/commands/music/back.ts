import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useHistory } from "discord-player";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const queueHistory = useHistory(interaction.guildId!);
      if (!queueHistory)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to get back",
        });

      queueHistory.previous();
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "🎶 The previous will start to play",
              iconURL: "https://img.icons8.com/color/512/first.png",
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
  alias: ["bk"],
  name: "back",
  description: "Play the previous song",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: false,
  requiredVoiceChannel: true,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
