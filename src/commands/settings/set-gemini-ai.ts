import config from "../../config";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const ignorePrefixOption = interaction.options.getString("ignore-prefix");
      const channelSetOption = interaction.options.getChannel("channel");

      // Fetch the current guild settings
      const guildSetting = await config.modules(interaction.guildId!);

      // Update Gemini AI settings
      guildSetting.geminiAI = {
        enabled: enabledOption,
        ignorePrefix: ignorePrefixOption || guildSetting.geminiAI.ignorePrefix,
        channelSet: channelSetOption?.id || guildSetting.geminiAI.channelSet,
      };
      // Save the updated settings
      await guildSetting.save();

      // Send a success message
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Gemini Ai** module settings`,
            description: `**Enabled**: \`${
              guildSetting.geminiAI.enabled
            }\`, **Ignore Prefix**: \`${
              guildSetting.geminiAI.ignorePrefix
            }\`, **Channel Set**: ${
              guildSetting.geminiAI.channelSet
                ? `<#${guildSetting.geminiAI.channelSet}>`
                : "`None`"
            }`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "set-gemini-ai",
  description: "Settings for GeminiAi module",
  deleted: false,
  devOnly: false,
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
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
