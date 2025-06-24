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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const targetUserId = interaction.options.get("target")?.value as string;

    try {
      const userSettings = await UserSettings.findOneAndUpdate(
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

      if (
        userSettings.temporaryVoiceChannel.blockedUsers.includes(targetUserId)
      )
        throw {
          name: "UserAlreadyBlocked",
          message: "This user is already blocked",
          type: "info",
        };

      userSettings.temporaryVoiceChannel.blockedUsers.push(targetUserId);
      await userSettings.save();

      const userVoiceChannel = (interaction.member as GuildMember).voice
        .channel;
      if (userVoiceChannel)
        if (checkOwnTempVoice(userVoiceChannel.id, interaction.user.id)) {
          const blockedUser = await interaction.guild?.members.fetch(
            targetUserId
          );

          if (!blockedUser || !blockedUser.voice.channel) return;

          if (blockedUser.voice.channel.id == userVoiceChannel.id)
            blockedUser.voice.disconnect();
        }

      interaction.editReply({
        embeds: [
          CommonEmbedBuilder.success({
            title: "> <:decoblockuser:1373931203887108098> Blocked User",
            description: `Blocked user: <@${targetUserId}>`,
          }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "voice-block",
  description: "Block a user from your temporary voice channel",
  deleted: false,
  options: [
    {
      name: "target",
      description: "Select user to block",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
};

export default command;
