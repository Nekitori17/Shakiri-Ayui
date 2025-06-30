import { getVoiceConnection } from "discord-voip";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    // TODO: Bot can't get the voice connection
    try {
      await interaction.deferReply();

      // Attempt to get the voice connection for the current guild
      const connection = getVoiceConnection(interaction.guildId!);

      // If no voice connection is found, throw an error
      if (!connection)
        throw {
          name: "NoVoiceConnection",
          message: "I'm not in a voice channel.",
        };

      // Destroy the voice connection, effectively leaving the channel
      connection.destroy();

      // Edit the deferred reply with a success embed
      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.info({
            title: "<:colorexit:1387287405488504882> Left Voice Channel",
            description: "Left the voice channel.",
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  alias: "lv",
  name: "leave",
  description: "Leaves the voice channel",
  deleted: false,
  devOnly: true,
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
