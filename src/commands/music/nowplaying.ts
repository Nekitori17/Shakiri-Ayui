import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { useQueue } from "discord-player";
import { repeatModeNames } from "../../data/musicRepeatModes";
import { musicSourceIcons } from "../../data/musicSourceIcons";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guild?.id!);
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
              iconURL: musicSourceIcons[track.source],
            })
            .setTimestamp()
            .setColor("#00a2ff"),
        ]
      })
    } catch (error: { name: string; message: string } | any) {
      interaction.editReply({
        content: null,
        components: undefined,
        files: undefined,
        attachments: undefined,
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
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
