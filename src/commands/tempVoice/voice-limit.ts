import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import UserSettings from "../../models/UserSettings";
import sendError from "../../helpers/sendError";
import checkOwnTempVoice from "../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../helpers/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const amountOfLimit = interaction.options.get("limit")?.value as number;

    try {
      const userSettings = await UserSettings.findOne({
        userId: interaction.user.id,
      });

      if (userSettings) {
        userSettings.temporaryVoiceChannel.limitUser = amountOfLimit;
        await userSettings.save();
      } else {
        const newUserSettings = new UserSettings({
          userId: interaction.user.id,
          temporaryVoiceChannel: {
            channelName: null,
            blockedUsers: [],
            limitUser: amountOfLimit,
          },
        });

        await newUserSettings.save();
      }

      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;
      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
          await userVoiceChannel.setUserLimit(amountOfLimit);

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "> Changed Temporary Channel Limit User",
            description: `Changed to amount: \`${amountOfLimit}\``,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "voice-limit",
  description: "Sets the limit of users in the voice channel",
  deleted: false,
  options: [
    {
      name: "limit",
      description: "The limit of users in the voice channel",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
};

export default command;
