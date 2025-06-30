import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { QueryType, TrackSource, useMainPlayer } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const queryOption = interaction.options.getString("query", true);
   
      // Get the main player instance
      const player = useMainPlayer();
      // Search for the track or playlist based on the query
      const searchResult = await player.search(queryOption, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!searchResult.hasTracks())
        throw {
          name: "NoResults",
          message: "Please try again or try a different query or platform",
        };
 
      // Inform the user that the track/playlist is loading
      await interaction.editReply(
        `> <a:colorhombusloader:1387284665177608252> Loading ${
          searchResult.playlist ? "playlist" : "track"
        }...`
      );
 
      // Get guild settings for music playback
      const guildSetting = await config.modules(interaction.guildId!);
      // Play the track or playlist in the user's voice channel
      const { track } = await player.play(
        (interaction.member as GuildMember).voice.channel!,
        searchResult,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
            },
            volume:
              (musicPlayerStoreSession.volume.get(
                interaction.guildId!
              ) as number) || guildSetting.music.volume,
            leaveOnEmpty: guildSetting.music.leaveOnEmpty,
            leaveOnEmptyCooldown: guildSetting.music.leaveOnEmptyCooldown,
            leaveOnEnd: guildSetting.music.leaveOnEnd,
            leaveOnEndCooldown: guildSetting.music.leaveOnEndCooldown,
          },
        }
      ); // Edit the reply to confirm the track has been added to the queue

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
    } catch (error) {
      sendError(interaction, error);
    }
  },
  alias: "p",
  name: "play",
  description: "Let the bot play a song",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "query",
      description: "The song to play",
      type: ApplicationCommandOptionType.String,
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
