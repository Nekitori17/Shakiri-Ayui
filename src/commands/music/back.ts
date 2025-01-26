import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useHistory } from "discord-player";
import sendError from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const history = useHistory(interaction.guildId!);
      if (!history)
        throw {
          name: "No Queue",
          message: "There is no queue to play",
        };

      history.previous();
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
      sendError(interaction, error)
    }
  },
  name: "back",
  description: "Play the previous song",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
