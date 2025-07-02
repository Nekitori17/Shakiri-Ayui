import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useHistory } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the history queue for the current guild
      const queueHistory = useHistory(interaction.guildId!);
      // If no history queue exists, throw a custom error
      if (!queueHistory)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to get back",
        });

      // Play the previous track in the history
      queueHistory.previous();
      // Edit the deferred reply with an embed confirming the previous track will play
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
    } catch (error) {
      sendError(interaction, error);
    }
  },
  alias: "bk",
  name: "back",
  description: "Play the previous song",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: true,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
