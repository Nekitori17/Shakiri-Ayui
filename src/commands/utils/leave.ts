import { useMainPlayer, VoiceUtils } from "discord-player";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    // TODO: Bot can't get the voice connection
    try {
      await interaction.deferReply();

      const connection = await new VoiceUtils(useMainPlayer()).getConnection(
        interaction.guildId!,
      );

      if (!connection)
        throw new client.CustomError({
          name: "NoVoiceConnection",
          message: "I'm not in a voice channel.",
        });

      connection.destroy();

      await interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.info({
            title: "<:colorexit:1387287405488504882> Left Voice Channel",
            description: "Left the voice channel.",
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["lv"],
  name: "leave",
  description: "Leaves the voice channel",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
