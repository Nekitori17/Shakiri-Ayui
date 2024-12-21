import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { QueryType, useMainPlayer } from "discord-player";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { musicSourceIcons } from "../../data/musicSourceIcons";
import config from "../../config";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const player = useMainPlayer();
    const query = interaction.options.get("query")?.value as string;
    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });

    try {
      if (!result.hasTracks())
        throw {
          name: "No Results",
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
            volume: settings.music?.volume,
            leaveOnEmpty: settings.music?.leaveOnEmpty,
            leaveOnEmptyCooldown: settings.music?.leaveOnEmptyCooldown,
            leaveOnEnd: settings.music?.leaveOnEnd,
            leaveOnEndCooldown: settings.music?.leaveOnEndCooldown,
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
              iconURL: musicSourceIcons[track.source],
            })
            .setColor("Green"),
        ],
      });
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
