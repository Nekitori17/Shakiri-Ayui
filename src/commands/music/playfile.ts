import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { QueryType, TrackSource, useMainPlayer } from "discord-player";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const attachmentOption = interaction.options.getAttachment(
        "attachment",
        true,
      );

      const player = useMainPlayer();
      const fileResult = await player.search(attachmentOption.url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.ARBITRARY,
      });

      if (!fileResult.hasTracks())
        throw new client.CustomError({
          name: "NoResults",
          message: "Please try again or try a different query or platform",
        });

      await interaction.editReply(
        `> <a:colorhombusloader:1387284665177608252> Loading ${
          fileResult.playlist ? "playlist" : "track"
        }...`,
      );

      const voiceStoreSession = new VoiceStoreSession(interaction.guildId!);

      const guildSetting = await client.getGuildSetting(interaction.guildId!);
      const { track } = await player.play(
        (interaction.member as GuildMember).voice.channel!,
        fileResult,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
            },
            volume: await voiceStoreSession.getVolume(),
            leaveOnEmpty: guildSetting.music.leaveOnEmpty,
            leaveOnEmptyCooldown: guildSetting.music.leaveOnEmptyCooldown,
            leaveOnEnd: guildSetting.music.leaveOnEnd,
            leaveOnEndCooldown: guildSetting.music.leaveOnEndCooldown,
          },
        },
      );

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
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["pf"],
  name: "playfile",
  description: "Play a song from attachment",
  deleted: false,
  devOnly: false,
  disabled: false,
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
