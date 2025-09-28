import { useMainPlayer, VoiceUtils } from "discord-player";
import { GuildMember } from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the member who initiated the interaction
      const interactionUserMember = interaction.member as GuildMember;
      // Get the voice channel the user is in
      const userVoiceChannel = interactionUserMember.voice.channel!;

      // Check if the bot has permission to join the user's voice channel
      if (!userVoiceChannel.joinable)
        throw new CustomError({
          name: "NotJoinable",
          message: "I can't join this voice channel.",
        });

      // Join the voice channel
      await new VoiceUtils(useMainPlayer()).join(userVoiceChannel);

      // Wait for the connection to be ready
      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.info({
            title: "<:colorok:1387277169817817209> Joined Voice Channel",
            description: `Joined ${userVoiceChannel.name} voice channel.`,
          }),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "jn",
  name: "join",
  description: "Join the voice channel you are currently in.",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: true,
};

export default command;
