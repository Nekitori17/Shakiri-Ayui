import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import UserSettings from "../../models/UserSettings";
import sendError from "../../helpers/utils/sendError";
import checkOwnTempVoice from "../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const amountOfLimitOption = interaction.options.getInteger("limit", true);

      if (amountOfLimitOption < 0)
        throw {
          name: "InvalidLimit",
          message: "The limit cannot be a negative number.",
          type: "warning",
        };

      // Find the user's settings, or create new ones if they don't exist
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
          new: true,
        }
      );

      // Update the user's temporary voice channel limit in settings
      userSetting.temporaryVoiceChannel.limitUser = amountOfLimitOption;
      await userSetting.save();

      // TODO: Make this command can use without join to a voice channel
      // Get the voice channel of the interacting member
      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;

      // If the user is in a voice channel and it's their own temporary channel
      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
          await userVoiceChannel.setUserLimit(amountOfLimitOption);

      interaction.editReply({
        embeds: [
          // Send a success embed indicating the limit has been changed
          CommonEmbedBuilder.success({
            title:
              "> <:colorconferencecall:1387286329003479213> Changed Temporary Channel Limit User",
            description: `Changed to amount: \`${amountOfLimitOption}\``,
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
  devOnly: false,
  options: [
    {
      name: "limit",
      description: "The limit of users in the voice channel",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
