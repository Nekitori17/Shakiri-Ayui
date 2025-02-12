import config from "../../config";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import sendError from "../../helpers/sendError";
import CommonEmbedBuilder from "../../helpers/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const enabled = interaction.options.get("enabled")?.value as boolean;
    const channelSet = interaction.options.get("channel")?.value as string;
    const startNumber = interaction.options.get("start-number")
      ?.value as number;

    try {
      const settings = await config.modules(interaction.guildId!);

      settings.countingGame = {
        enabled,
        channelSet: channelSet || settings.countingGame.channelSet,
        startNumber: startNumber || settings.countingGame.startNumber,
      };

      await settings.save();

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Counting Game** module settings`,
            description: `**Enabled**: \`${
              settings.countingGame.enabled
            }\`, **Channel Set**: ${
              settings.countingGame.channelSet
                ? `<#${settings.countingGame.channelSet}>`
                : "`None`"
            }, **Start Number**: \`${settings.countingGame.startNumber}\``,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
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
