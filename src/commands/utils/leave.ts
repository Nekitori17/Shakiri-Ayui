import { getVoiceConnection } from "discord-voip";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const connection = getVoiceConnection(interaction.guildId!);

      if (!connection)
        throw {
          name: "NoVoiceConnection",
          message: "I'm not in a voice channel.",
        };

      connection.destroy();
      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.info({
            title: "<:neonexport:1387061808988160090> Left Voice Channel",
            description: "Left the voice channel.",
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "leave",
  description: "Leaves the voice channel",
  deleted: false,
};

export default command;
