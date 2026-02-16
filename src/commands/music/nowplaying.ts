import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue, TrackSource } from "discord-player";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { advancedMusicControllerButtonRows } from "../../components/musicControllerMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const queue = useQueue(interaction.guildId!);

      if (!queue || !queue.isPlaying())
        throw new client.CustomError({
          name: "NoSongPlaying",
          message: "There is no song playing",
        });

      const track = queue.currentTrack!;
      const progressBar = queue.node.createProgressBar({
        // Progress bar customization
        indicator: "<:colormusicindicator:1387293562328060115>",
        leftChar: "<:colormusicleftchar:1387293293192417290>",
        rightChar: "<:colormusicrightchar:1387293480761425982>",
        timecodes: true,
        length: 11,
      });

      const voiceStoreSession = new VoiceStoreSession(interaction.guildId!);
      const volume = await voiceStoreSession.getVolume();
      const repeatMode = voiceStoreSession.getRepeatMode();
      const shuffledTimes = voiceStoreSession.getShuffledTimes();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Requested by: ${track.requestedBy?.displayName}`,
              iconURL: track.requestedBy?.displayAvatarURL(),
            })
            .setTitle(
              "> <:coloraigeneratedmusic:1387292099963125821> Now playing",
            )
            .setDescription(
              `* <:colordocumentheader:1387282793037303834> **Title**: ${track.title}` +
                "\n" +
                `* <:colordj:1387283095820046456> **Artist**: ${track.author}` +
                "\n" +
                `* <:colorvisible:1387281699859070976> **View**: ${track.views.toLocaleString()}` +
                "\n" +
                `* <:colorvolume:1387283301202526269> **Volume**: ${volume.toString()}%` +
                "\n" +
                `* <:colorsynchronize:1387283489883164733> **Loop**: ${
                  repeatModeNames[repeatMode || 0]
                }` +
                "\n" +
                `* <:colorshuffle:1387283637191442553> **Shuffled**: ${
                  shuffledTimes > 1
                    ? `${shuffledTimes} times`
                    : `${shuffledTimes} time`
                }` +
                "\n" +
                progressBar,
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
              text: `ID: ${track.id}`,
              iconURL: musicSourceIcons[track.source as TrackSource],
            })
            .setTimestamp()
            .setColor("#00a2ff"),
        ],
        components: [...advancedMusicControllerButtonRows],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["np"],
  name: "nowplaying",
  description: "Get info about the current song",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
