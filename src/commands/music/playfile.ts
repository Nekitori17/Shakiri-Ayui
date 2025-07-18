import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { QueryType, TrackSource, useMainPlayer } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { MusicPlayerSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const attachmentOption = interaction.options.getAttachment(
        "attachment",
        true
      );

      // Get the main player instance
      const player = useMainPlayer();
      // Search for the file based on the attachment URL
      const fileResult = await player.search(attachmentOption.url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.ARBITRARY,
      });

      if (!fileResult.hasTracks())
        throw new CustomError({
          name: "NoResults",
          message: "Please try again or try a different query or platform",
        });

      // Inform the user that the file is loading
      await interaction.editReply(
        `> <a:colorhombusloader:1387284665177608252> Loading ${
          fileResult.playlist ? "playlist" : "track"
        }...`
      );

      // Retrieve volume, repeat mode, and shuffle count from session store or queue
      const musicPlayerStoreSession = new MusicPlayerSession(
        interaction.guildId!
      );

      // Get guild settings for music playback
      const guildSetting = await config.modules(interaction.guildId!);
      const { track } = await player.play(
        (interaction.member as GuildMember).voice.channel!,
        fileResult,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
            },
            volume: await musicPlayerStoreSession.getVolume(),
            leaveOnEmpty: guildSetting.music.leaveOnEmpty,
            leaveOnEmptyCooldown: guildSetting.music.leaveOnEmptyCooldown,
            leaveOnEnd: guildSetting.music.leaveOnEnd,
            leaveOnEndCooldown: guildSetting.music.leaveOnEndCooldown,
          },
        }
      );

      // Edit the reply to confirm the track has been added to the queue
      interaction.editReply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `🎶 | Added ${track.title} by ${track.author} to the queue!`,
              iconURL: track.thumbnail,
              url: track.url,
            })
            .setFooter({
              text: `Request by: ${track.requestedBy?.displayName}`,
              iconURL: musicSourceIcons[track.source as TrackSource],
            })
            .setColor("Green"),
        ],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "pf",
  name: "playfile",
  description: "Play a song from attachment",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "attachment",
      description: "The file to play",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: true,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
