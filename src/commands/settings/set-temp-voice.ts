import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import config from "../../config";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const enabled = interaction.options.get("enabled")?.value as boolean;
    const channelSet = interaction.options.get("channel")?.value as string;
    const categorySet = interaction.options.get("category")?.value as string;

    try {
      const settings = await config.modules(interaction.guildId!);

      settings.temporaryVoiceChannel = {
        enabled,
        channelSet: channelSet || settings.temporaryVoiceChannel?.channelSet,
        nameChannelSyntax: settings.temporaryVoiceChannel?.nameChannelSyntax!,
        categorySet: categorySet || settings.temporaryVoiceChannel?.categorySet,
      };

      await settings.save()

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Temporary Voice Channel** settings`,
            description: `**Enabled**: \`${
              settings.temporaryVoiceChannel?.enabled
            }\`, **Channel Set**: ${
              settings.temporaryVoiceChannel?.channelSet
                ? `<#${settings.temporaryVoiceChannel?.channelSet}>`
                : "`None`"
            }, **Category Set**: ${
              settings.temporaryVoiceChannel?.categorySet
                ? `<#${settings.temporaryVoiceChannel?.categorySet}>`
                : "`None`"
            }`,
          }),
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
  name: "set-temp-voice",
  description: "Set temporary voice channel",
  options: [
    {
      name: "enabled",
      description: "Enabled this module or not",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
    {
      name: "channel",
      description: "Channel to send the temporary voice channel to",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "category",
      description: "Category to send the temporary voice channel to",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
  ],
  deleted: false,
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
