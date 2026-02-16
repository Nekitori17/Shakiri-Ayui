import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const ignorePrefixOption = interaction.options.getString("ignore-prefix");
      const channelSetOption = interaction.options.getChannel("channel");

      if (channelSetOption && channelSetOption.type != ChannelType.GuildText)
        throw new client.CustomError({
          name: "InvalidChannelType",
          message: "Channel must be a text channel!",
        });

      const guildSetting = await client.getGuildSetting(interaction.guildId!);

      guildSetting.geminiAI = {
        enabled: enabledOption,
        ignorePrefix: ignorePrefixOption || guildSetting.geminiAI.ignorePrefix,
        channelSet: channelSetOption?.id || guildSetting.geminiAI.channelSet,
      };
      await guildSetting.save();

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "set-gemini-ai",
  description: "Settings for GeminiAi module",
  disabled: false,
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
