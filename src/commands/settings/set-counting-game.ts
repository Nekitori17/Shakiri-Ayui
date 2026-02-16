import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import CountingGame from "../../models/miniGames/CountingGame";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const enabledOption = interaction.options.getBoolean("enabled", true);
      const channelSetOption = interaction.options.getChannel("channel");
      const startNumberOption = interaction.options.getNumber("start-number");

      //
      if (channelSetOption && channelSetOption.type != ChannelType.GuildText)
        throw new client.CustomError({
          name: "InvalidChannelType",
          message: "Channel must be a text channel!",
        });

      const guildSetting = await client.getGuildSetting(interaction.guildId!);

      guildSetting.countingGame = {
        enabled: enabledOption,
        channelSet:
          channelSetOption?.id || guildSetting.countingGame.channelSet,
        startNumber: startNumberOption || guildSetting.countingGame.startNumber,
      };

      if (!enabledOption) {
        await CountingGame.deleteOne({
          guildId: interaction.guildId,
        });
      }

      await guildSetting.save();

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return true;
    }
  },

  name: "set-counting-game",
  description: "Settings for counting game module",
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
