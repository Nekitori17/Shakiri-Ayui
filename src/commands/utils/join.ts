import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from "discord-voip";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const member = interaction.member as GuildMember;
      const userVoiceChannel = member.voice.channel!;

      if (!interaction.guild || !interaction.guild.voiceAdapterCreator) {
        throw {
          name: "NoGuildOrVoiceAdapter",
          message:
            "This command can only be used in a server with a voice adapter.",
        };
      }

      if (!userVoiceChannel.joinable) {
        throw {
          name: "NotJoinable",
          message: "I can't join this voice channel.",
        };
      }

      const connection = joinVoiceChannel({
        channelId: userVoiceChannel.id,
        guildId: interaction.guildId!,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      await interaction.editReply({
        embeds: [
          CommonEmbedBuilder.info({
            title: "<:colorok:1387277169817817209> Joined Voice Channel",
            description: `Joined ${userVoiceChannel.name} voice channel.`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "join",
  description: "Join the voice channel you are currently in.",
  deleted: false,
  voiceChannel: true,
};

export default command;
