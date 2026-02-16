import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import checkOwnTempVoice from "../../helpers/discord/validators/checkOwnTempVoice";
import UserSettings from "../../models/UserSettings";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const amountOfLimitOption = interaction.options.getInteger("limit", true);

      if (amountOfLimitOption < 0 || amountOfLimitOption > 99)
        throw new client.CustomError({
          name: "InvalidLimit",
          message: "The limit cannot be a negative number or greater than 99",
          type: "warning",
        });

      const userSetting = await UserSettings.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: interaction.user.id,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );

      userSetting.temporaryVoiceChannel.limitUser = amountOfLimitOption;
      await userSetting.save();

      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;

      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
          await userVoiceChannel.setUserLimit(amountOfLimitOption);

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title:
              "> <:colorconferencecall:1387286329003479213> Changed Temporary Channel Limit User",
            description: `Changed to amount: \`${amountOfLimitOption}\``,
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "voice-limit",
  description: "Sets the limit of users in the voice channel",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "limit",
      description: "The limit of users in the voice channel",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
