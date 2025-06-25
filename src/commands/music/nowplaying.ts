import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useQueue, TrackSource, QueueRepeatMode } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import {
  extendMusicControllerButtonsRow,
  mainMusicControllerButtonsRow,
} from "../../components/musicControllerMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue || !queue.isPlaying())
        throw {
          name: "NoSongPlaying",
          message: "There is no song playing",
        };

      const track = queue.currentTrack!;
      const progress = queue.node.createProgressBar({
        indicator: "<:colormusicindicator:1387293562328060115>",
        leftChar: "<:colormusicleftchar:1387293293192417290>",
        rightChar: "<:colormusicrightchar:1387293480761425982>",
        timecodes: true,
        length: 11,
      });
      const volume =
        (musicPlayerStoreSession.volume.get(interaction.guildId!) as Number) ||
        queue.node.volume;
      const repeatMode =
        (musicPlayerStoreSession.loop.get(
          interaction.guildId!
        ) as QueueRepeatMode) || queue.repeatMode;
      const shuffeledTimes =
        (musicPlayerStoreSession.shuffeld.get(
          interaction.guildId!
        ) as number) || 0;

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Requested by: ${track.requestedBy?.displayName}`,
              iconURL: track.requestedBy?.displayAvatarURL(),
            })
            .setTitle(
              "> <:coloraigeneratedmusic:1387292099963125821> Now playing"
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
                  shuffeledTimes > 1
                    ? `${shuffeledTimes} times`
                    : `${shuffeledTimes} time`
                }` +
                "\n" +
                progress
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
              text: `ID: ${track.id}`,
              iconURL: musicSourceIcons[track.source as TrackSource],
            })
            .setTimestamp()
            .setColor("#00a2ff"),
        ],
        components: [
          mainMusicControllerButtonsRow,
          extendMusicControllerButtonsRow,
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "nowplaying",
  description: "Get info about the current song",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
