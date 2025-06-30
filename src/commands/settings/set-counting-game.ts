import config from "../../config";
import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import CountingGame from "../../models/CountingGame";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const channelSetOption = interaction.options.getChannel("channel");
      const startNumberOption = interaction.options.getNumber("start-number");

      // 
      if (channelSetOption?.type != ChannelType.GuildText)
        throw {
          name: "InvalidChannelType",
          message: "Channel must be a text channel!",
        };

      // Fetch the current guild settings
      const guildSetting = await config.modules(interaction.guildId!);

      // Update counting game settings
      guildSetting.countingGame = {
        enabled: enabledOption,
        channelSet:
          channelSetOption?.id || guildSetting.countingGame.channelSet,
        startNumber: startNumberOption || guildSetting.countingGame.startNumber,
      };

      // If disable this module reset counting game data
      if (!enabledOption) {
        await CountingGame.deleteOne({
          guildId: interaction.guildId,
        });
      }

      // Save the updated settings
      await guildSetting.save();

      // Send a success message
      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: `Updated **Counting Game** module setting`,
            description: `**Enabled**: \`${
              guildSetting.countingGame.enabled
            }\`, **Channel Set**: ${
              guildSetting.countingGame.channelSet
                ? `<#${guildSetting.countingGame.channelSet}>`
                : "`None`"
            }, **Start Number**: \`${guildSetting.countingGame.startNumber}\``,
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
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};

export default command;
