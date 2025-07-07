import config from "../../config";
import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";

import { CustomError } from "../../helpers/utils/CustomError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const loggingChannelOption = interaction.options.getChannel("channel");

      // Validate channel type if a channel is provided
      if (loggingChannelOption && loggingChannelOption.type != ChannelType.GuildText)
        throw new CustomError({
          name: "InvalidChannelType",
          message: "Channel must be a text channel!",
        });

      // Fetch the current guild settings
      const guildSetting = await config.modules(interaction.guildId!);

      // Update moderator settings
      guildSetting.moderator = {
        logging: enabledOption,
        loggingChannel:
          loggingChannelOption?.id || guildSetting.moderator.loggingChannel,
      };

      // Save the updated settings
      await guildSetting.save();

      // Send a success message
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Moderator Logging** module settings`,
            description: `**Logging**: \`${
              guildSetting.moderator.logging
            }\`, **Channel Logging**: ${
              guildSetting.moderator.loggingChannel
                ? `<#${guildSetting.moderator.loggingChannel}>`
                : "`None`"
            }`,
          }),
        ],
      });

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "set-moderator-log",
  description: "Settings for moderator log module",
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
      description: "Channel to send the moderator log to",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
