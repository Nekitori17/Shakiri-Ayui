import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { QueryType, useMainPlayer } from "discord-player";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
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

      await player.play(
        (interaction.member as GuildMember).voice.channel!,
        result,
        {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
            },
            volume: config.modules.music.volume,
            leaveOnEmpty: config.modules.music.leaveOnEmpty,
            leaveOnEmptyCooldown: config.modules.music.leaveOnEmptyCooldown,
            leaveOnEnd: config.modules.music.leaveOnEnd,
            leaveOnEndCooldown: config.modules.music.leaveOnEndCooldown,
          },
        }
      );

      interaction.deleteReply()
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
