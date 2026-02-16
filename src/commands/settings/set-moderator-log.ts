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
      const loggingChannelOption = interaction.options.getChannel("channel");

      if (
        loggingChannelOption &&
        loggingChannelOption.type != ChannelType.GuildText
      )
        throw new client.CustomError({
          name: "InvalidChannelType",
          message: "Channel must be a text channel!",
        });

      const guildSetting = await client.getGuildSetting(interaction.guildId!);

      guildSetting.moderator = {
        loggingEnabled: enabledOption,
        loggingChannel:
          loggingChannelOption?.id || guildSetting.moderator.loggingChannel,
      };

      await guildSetting.save();

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: `Updated **Moderator Logging** module settings`,
            description: `**Logging**: \`${
              guildSetting.moderator.loggingEnabled
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
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "set-moderator-log",
  description: "Settings for moderator log module",
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
