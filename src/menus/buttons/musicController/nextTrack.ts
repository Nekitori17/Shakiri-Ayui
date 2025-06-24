import { EmbedBuilder } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to play",
        };

      queue.node.skip();
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "<:neonmusic:1387059800721981473> The track has been skipped!",
              iconURL: "https://img.icons8.com/color/512/last.png",
            })
            .setColor("#73ff00"),
        ],
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
