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
        indicator: "▒",
        leftChar: "▓",
        rightChar: "░",
        timecodes: true,
        length: 20,
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
            .setTitle("> 🎼 Now playing")
            .setDescription(
              `* Title: ${track.title}` +
                "\n" +
                `* Artist: ${track.author}` +
                "\n" +
                `* Volume: ${volume.toString()}%` +
                "\n" +
                `* Loop: ${repeatModeNames[repeatMode || 0]}` +
                "\n" +
                `* Shuffled: ${
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
