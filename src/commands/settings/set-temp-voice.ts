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
      const channelSetOption = interaction.options.getChannel("channel");
      const categorySetOption = interaction.options.getChannel("category");

      if (channelSetOption && channelSetOption?.type != ChannelType.GuildVoice)
        throw new client.CustomError({
          name: "InvalidChannelType",
          message: "Channel must be a voice channel!",
        });

      if (
        categorySetOption &&
        categorySetOption?.type != ChannelType.GuildCategory
      )
        throw new client.CustomError({
          name: "InvalidChannelType",
          message: "Category must be a category channel!",
        });

      const guildSetting = await client.getGuildSetting(interaction.guildId!);

      guildSetting.temporaryVoiceChannel = {
        enabled: enabledOption,
        channelSet:
          channelSetOption?.id || guildSetting.temporaryVoiceChannel.channelSet,
        nameChannelSyntax:
          guildSetting.temporaryVoiceChannel.nameChannelSyntax!,
        categorySet:
          categorySetOption?.id ||
          guildSetting.temporaryVoiceChannel.categorySet,
      };

      await guildSetting.save();

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: `Updated **Temporary Voice Channel** settings`,
            description: `**Enabled**: \`${
              guildSetting.temporaryVoiceChannel.enabled
            }\`, **Channel Set**: ${
              guildSetting.temporaryVoiceChannel.channelSet
                ? `<#${guildSetting.temporaryVoiceChannel.channelSet}>`
                : "`None`"
            }, **Category Set**: ${
              guildSetting.temporaryVoiceChannel.categorySet
                ? `<#${guildSetting.temporaryVoiceChannel.categorySet}>`
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
  name: "set-temp-voice",
  description: "Set temporary voice channel",
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
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
