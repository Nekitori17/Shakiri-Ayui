import config from "../../config";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../utils/sendError";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const enabled = interaction.options.get("enabled")?.value as boolean;
    const channelSend = interaction.options.get("channel")?.value as string;
    const reset = interaction.options.get("reset")?.value as boolean;

    try {
      const settings = await config.modules(interaction.guildId!);

      if (reset) {
        settings.welcomer = {
          enabled: false,
          channelSend: undefined,
          message: "> Welcome {user} to __{guild}__.",
          backgroundImage: "https://i.ibb.co/BnCqSH0/banner.jpg",
          imageTitle: "{user_display}",
          imageBody: "Welcome to {guild}",
          imageFooter: "Member #{member_count}",
        };
      }

      settings.welcomer = {
        enabled,
        channelSend: channelSend || settings.welcomer.channelSend,
        message: settings.welcomer.message,
        backgroundImage: settings.welcomer.backgroundImage,
        imageTitle: settings.welcomer.imageTitle,
        imageBody: settings.welcomer.imageBody,
        imageFooter: settings.welcomer.imageFooter,
      };

      await settings.save();

      const advancedSettingsTxt =
        ">> Custom Message <<" +
        "\n" +
        settings.welcomer.message +
        "\n" +
        ">> Image Title <<" +
        "\n" +
        settings.welcomer.imageTitle +
        "\n" +
        ">> Image Body <<" +
        "\n" +
        settings.welcomer.imageBody +
        "\n" +
        ">> Image Footer <<" +
        "\n" +
        settings.welcomer.imageFooter;

      const fileContent = Buffer.from(advancedSettingsTxt, "utf-8");
      const attachment = new AttachmentBuilder(fileContent, {
        name: "customize-setting-data.md",
      });

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "Updated **Welcomer** module settings",
            description: `**Enabled**: \`${
              settings.welcomer.enabled
            }\`, **Channel Send**: ${
              settings.welcomer.channelSend
                ? `<#${settings.welcomer.channelSend}>`
                : "`None`"
            }`,
          }),
        ],
        files: [attachment],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "set-welcomer",
  description: "Settings for welcomer module",
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
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
