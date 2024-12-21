import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import config from "../../config";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const logging = interaction.options.get("enabled")?.value as boolean;
    const loggingChannel = interaction.options.get("channel")?.value as string;

    try {
      const settings = await config.modules(interaction.guildId!);

      settings.moderator = {
        logging: logging,
        loggingChannel: loggingChannel || settings.moderator?.loggingChannel,
      };
      await settings.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Moderator Logging** module settings`,
            description: `**Logging**: \`${
              settings.moderator?.logging
            }\`, **Channel Logging**: ${
              settings.moderator?.loggingChannel
                ? `<#${settings.moderator?.loggingChannel}>`
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
  name: "set-moderator-log",
  description: "Settings for moderator log module",
  deleted: false,
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
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
