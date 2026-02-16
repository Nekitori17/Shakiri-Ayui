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
      const targetUserOption = interaction.options.getUser("target", true);

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

      if (
        userSetting.temporaryVoiceChannel.blockedUsers.includes(
          targetUserOption.id,
        )
      )
        throw new client.CustomError({
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
            targetUserOption.id,
          );

          // If the blocked user exists and is in a voice channel
          if (!blockedUser || !blockedUser.voice.channel) return;

          if (blockedUser.voice.channel.id == userVoiceChannel.id)
            blockedUser.voice.disconnect();
        }

      interaction.editReply({
        embeds: [
          client.CommonEmbedBuilder.success({
            title: "> <:colorroadblock:1387286123868586054> Blocked User",
            description: `Blocked user: ${targetUserOption}`,
          }),
        ],
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "voice-block",
  description: "Block a user from your temporary voice channel",
  disabled: false,
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
