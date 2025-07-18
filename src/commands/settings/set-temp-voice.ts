import config from "../../config";
import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const channelSetOption = interaction.options.getChannel("channel");
      const categorySetOption = interaction.options.getChannel("category");

      // Validate channel and category types if provided
      if (channelSetOption && channelSetOption?.type != ChannelType.GuildVoice)
        throw new CustomError({
          name: "InvalidChannelType",
          message: "Channel must be a voice channel!",
        });

      if (
        categorySetOption &&
        categorySetOption?.type != ChannelType.GuildCategory
      )
        throw new CustomError({
          name: "InvalidChannelType",
          message: "Category must be a category channel!",
        });

      // Fetch the current guild settings from the configuration
      const guildSetting = await config.modules(interaction.guildId!);

      // Update the temporary voice channel settings
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

      // Save the updated settings to the database
      await guildSetting.save();

      // Send a success message to the user
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
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
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "set-temp-voice",
  description: "Set temporary voice channel",
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
