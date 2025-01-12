import config from "../../config";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { sendError } from "../../utils/sendError";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const enabled = interaction.options.get("enabled")?.value as boolean;
    const ignorePrefix = interaction.options.get("ignorePrefix")
      ?.value as string;
    const channelSet = interaction.options.get("channel")?.value as string;

    try {
      const settings = await config.modules(interaction.guildId!);

      settings.geminiAI = {
        enabled,
        ignorePrefix: ignorePrefix || settings.geminiAI.ignorePrefix,
        channelSet: channelSet || settings.geminiAI.channelSet,
      };
      await settings.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Gemini Ai** module settings`,
            description: `**Enabled**: \`${
              settings.geminiAI.enabled
            }\`, **Ignore Prefix**: \`${
              settings.geminiAI.ignorePrefix
            }\`, **Channel Set**: ${
              settings.geminiAI.channelSet
                ? `<#${settings.geminiAI.channelSet}>`
                : "`None`"
            }`,
          }),
        ],
      });
    } catch (error: { name: string; message: string } | any) {
      sendError(interaction, error);
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
