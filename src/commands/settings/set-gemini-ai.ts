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
    const ignorePrefix = interaction.options.get("ignorePrefix")
      ?.value as string;
    const channelSet = interaction.options.get("channel")?.value as string;

    try {
      const settings = await config.modules(interaction.guildId!);

      settings.geminiAI = {
        enabled,
        ignorePrefix: ignorePrefix || settings.geminiAI?.ignorePrefix!,
        channelSet: channelSet || settings.geminiAI?.channelSet,
      };
      await settings.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Gemini Ai** module settings`,
            description: `**Enabled**: \`${
              settings.geminiAI?.enabled
            }\`, **Ignore Prefix**: \`${
              settings.geminiAI?.ignorePrefix
            }\`, **Channel Set**: ${
              settings.geminiAI?.channelSet
                ? `<#${settings.geminiAI?.channelSet}>`
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
  name: "set-gemini-ai",
  description: "Settings for GeminiAi module",
  deleted: false,
  options: [
    {
      name: "enabled",
      description: "Enabled this module or not",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
    {
      name: "ignore-prefix",
      description: "Ignore the command prefix when using Gemini AI",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "channel",
      description: "Channel to send the gemini ai response to",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
