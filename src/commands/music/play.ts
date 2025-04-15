import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { QueryType, TrackSource, useMainPlayer } from "discord-player";
import sendError from "../../helpers/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const query = interaction.options.get("query")?.value as string;

    try {
      const player = useMainPlayer();
      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!result.hasTracks())
        throw {
          name: "NoResults",
          message: "Please try again or try a different query or platform",
        };

      await interaction.editReply(
        `> 🎶 Loading ${result.playlist ? "playlist" : "track"}...`
      );

      const settings = await config.modules(interaction.guildId!);
      const { track } = await player.play(
        (interaction.member as GuildMember).voice.channel!,
        result,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
            },
            volume:
              (musicPlayerStoreSession.volume.get(
                interaction.guildId!
              ) as number) || settings.music.volume,
            leaveOnEmpty: settings.music.leaveOnEmpty,
            leaveOnEmptyCooldown: settings.music.leaveOnEmptyCooldown,
            leaveOnEnd: settings.music.leaveOnEnd,
            leaveOnEndCooldown: settings.music.leaveOnEndCooldown,
          },
        }
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
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "play",
  description: "Let the bot play a song",
  deleted: false,
  voiceChannel: true,
  options: [
    {
      name: "query",
      description: "The song to play",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
