import { GuildMember } from "discord.js";
import { useMainPlayer, VoiceUtils } from "discord-player";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const interactionUserMember = interaction.member as GuildMember;
      const userVoiceChannel = interactionUserMember.voice.channel!;

      if (!userVoiceChannel.joinable)
        throw new client.CustomError({
          name: "NotJoinable",
          message: "I can't join this voice channel.",
        });

      await new VoiceUtils(useMainPlayer()).join(userVoiceChannel);

      await interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.info({
            title: "<:colorok:1387277169817817209> Joined Voice Channel",
            description: `Joined ${userVoiceChannel.name} voice channel.`,
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["jn"],
  name: "join",
  description: "Join the voice channel you are currently in.",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: false,
  requiredVoiceChannel: true,
};

export default command;
