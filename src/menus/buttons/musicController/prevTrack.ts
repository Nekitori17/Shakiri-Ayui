import { EmbedBuilder } from "discord.js";
import { useHistory } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const history = useHistory(interaction.guildId!);
      if (!history)
        throw {
          name: "NoQueue",
          message: "There is no queue to play",
        };

      await history.previous();
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
  disabled: false,
  voiceChannel: true,
};

export default button;
