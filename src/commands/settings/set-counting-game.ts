import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import config from "../../config";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const enabled = interaction.options.get("enabled")?.value as boolean;
    const channelSet = interaction.options.get("channel")?.value as string;
    const startNumber = interaction.options.get("start-number")
      ?.value as number;

    try {
      const settings = await config.modules(interaction.guildId!);

      settings.countingGame = {
        enabled,
        channelSet: channelSet || settings.countingGame?.channelSet,
        startNumber: startNumber || settings.countingGame?.startNumber!,
      };

      await settings.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Counting Game** module settings`,
            description: `**Enabled**: \`${
              settings.countingGame?.enabled
            }\`, **Channel Set**: ${
              settings.countingGame?.channelSet
                ? `<#${settings.countingGame?.channelSet}>`
                : "`None`"
            }, **Start Number**: \`${settings.countingGame?.startNumber}\``,
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
  name: "set-counting-game",
  description: "Settings for counting game module",
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
      description: "Channel to send the counting game to",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "start-number",
      description: "Start number for counting game",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
