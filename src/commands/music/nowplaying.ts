import {
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { useQueue, TrackSource } from "discord-player";
import sendError from "../../utils/sendError";
import { repeatModeNames } from "../../constants/musicRepeatModes";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue || !queue.isPlaying())
        throw {
          name: "No song playing",
          message: "There is no song playing",
        };

      const track = queue.currentTrack!;
      const progress = queue.node.createProgressBar({
        indicator: "▒",
        leftChar: "▓",
        rightChar: "░",
        timecodes: true,
        length: 20
      })
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Requested by: ${track.requestedBy?.displayName}`,
              iconURL: track.requestedBy?.displayAvatarURL(),
            })
            .setTitle("> 🎼 Now playing")
            .setDescription(
              `* Title: ${track.title}` + "\n" +
              `* Artist: ${track.author}` + "\n" +
              `* Views: ${track.views.toLocaleString("vi-VN")}` + "\n" +
              `* Volume: ${queue.options.volume.toString()}` + "\n" +
              `* Loop: ${repeatModeNames[queue.options.repeatMode || 0]}` + "\n" +
              `* Shuffled: ${queue.isShuffling ? "On" : "Off"}` + "\n" +
              progress
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
              text: `ID: ${track.id}`,
              iconURL: musicSourceIcons[track.source as TrackSource],
            })
            .setTimestamp()
            .setColor("#00a2ff"),
        ]
      })
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
