import {
  ApplicationCommandOptionType,
  GuildMember,
  MessageFlags,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import checkOwnTempVoice from "../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import UserSettings from "../../models/UserSettings";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const targetUserOption = interaction.options.getUser("target", true);

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

      // Check if the user is already blocked
      if (
        userSetting.temporaryVoiceChannel.blockedUsers.includes(
          targetUserOption.id
        )
      )
        throw new CustomError({
          name: "UserAlreadyBlocked",
          message: "This user is already blocked",
          type: "info",
        });

      // Add the target user to the blocked users list and save settings
      userSetting.temporaryVoiceChannel.blockedUsers.push(targetUserOption.id);
      await userSetting.save();

      // Get the voice channel of the interacting member
      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;

      // If the user is in a voice channel and it's their own temporary channel
      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id)) {
          // Fetch the blocked user's guild member object
          const blockedUser = await interaction.guild?.members.fetch(
            targetUserOption.id
          );

          // If the blocked user exists and is in a voice channel
          if (!blockedUser || !blockedUser.voice.channel) return;

          if (blockedUser.voice.channel.id == userVoiceChannel.id)
            blockedUser.voice.disconnect();
        }

      interaction.editReply({
        // Send a success embed indicating the user has been blocked
        embeds: [
          CommonEmbedBuilder.success({
            title: "> <:colorroadblock:1387286123868586054> Blocked User",
            description: `Blocked user: ${targetUserOption}`,
          }),
        ],
      });

      return true;
    } catch (error) {
      sendError(interaction, error);

      return false;
    }
  },
  name: "voice-block",
  description: "Block a user from your temporary voice channel",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "Select user to block",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
