import config from "../../config";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const channelSendOption = interaction.options.getChannel("channel");
      const resetOption = interaction.options.getBoolean("reset");

      // Validate the channel type if provided
      if (channelSendOption?.type != ChannelType.GuildText)
        throw {
          name: "InvalidChannelType",
          message: "Channel must be a text channel!",
        };

      // Fetch the current guild settings
      const guildSetting = await config.modules(interaction.guildId!);

      // Check if the reset option is true
      if (resetOption) {
        guildSetting.welcomer = {
          enabled: false,
          channelSend: undefined,
          // Set default values for welcomer settings
          message: "> Welcome {user} to __{guild.name}__.",
          imageTitle: "Welcome #{guild.count}",
          imageBody: "{user.displayName}",
          imageFooter: "To {guild.name}",
        };
      }

      // Update welcomer settings
      guildSetting.welcomer = {
        enabled: enabledOption,
        channelSend: channelSendOption?.id || guildSetting.welcomer.channelSend,
        message: guildSetting.welcomer.message,
        imageTitle: guildSetting.welcomer.imageTitle,
        imageBody: guildSetting.welcomer.imageBody,
        imageFooter: guildSetting.welcomer.imageFooter,
      };

      // Save the updated settings
      await guildSetting.save();

      // Prepare the advanced settings text for attachment
      const advancedSettingsTxt =
        ">> Custom Message <<" +
        "\n" +
        guildSetting.welcomer.message +
        "\n" +
        ">> Image Title <<" +
        "\n" +
        guildSetting.welcomer.imageTitle +
        "\n" +
        ">> Image Body <<" +
        "\n" +
        guildSetting.welcomer.imageBody +
        "\n" +
        ">> Image Footer <<" +
        "\n" +
        guildSetting.welcomer.imageFooter;

      // Create an attachment with the advanced settings data
      const advancedSettingFileAttachment = new AttachmentBuilder(
        Buffer.from(advancedSettingsTxt, "utf-8"),
        {
          name: "customize-setting-data.md",
        }
      );

      // Send a success message with the updated settings and attachment
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Updated **Welcomer** module settings",
            description: `**Enabled**: \`${
              guildSetting.welcomer.enabled
            }\`, **Channel Send**: ${
              guildSetting.welcomer.channelSend
                ? `<#${guildSetting.welcomer.channelSend}>`
                : "`None`"
            }`,
          }),
        ],
        files: [advancedSettingFileAttachment],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "set-welcomer",
  description: "Settings for welcomer module",
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
      description: "Channel to send the welcomer to",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "reset",
      description: "Reset this module settings",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
