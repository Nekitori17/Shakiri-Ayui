import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { checkUserRolePosition } from "../../validator/checkRolePosition";
import { ModerationEmbedBuilder } from "../../helpers/embeds/moderationEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("target", true);
      const reasonOption = interaction.options.getString("reason");

      // Fetch the target user as a guild member
      const targetUser = await interaction.guild?.members.fetch(
        targetUserOption
      );

      // Check if the target user exists in the server
      if (!targetUser)
        throw new CustomError({
          name: "UserNotFound",
          message: "That user does not exist in this server",
        });

      // Check if the target is the server owner
      if (targetUser.id === interaction.guild?.ownerId)
        throw new CustomError({
          name: "OwnerIsMuted?",
          message: "Nahhh. I don't think owner can be muted",
          type: "warning",
        });

      // Check if the target is the bot itself
      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new CustomError({
          name: "OhhhMyGod...",
          message: "I even can't do that",
          type: "warning",
        });

      // Get role positions for hierarchy check
      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser
      );

      // Check if the target user is not muted
      if (!targetUser?.isCommunicationDisabled())
        throw new CustomError({
          name: "UserIsNotMuted",
          message: "This user is not muted",
          type: "warning",
        });

      // Remove the timeout (unmute) from the user
      await targetUser.timeout(null, reasonOption || undefined);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🥶| ${targetUser.user.displayName} has been unmuted`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`
            )
            .setColor("Green"),
        ],
      });

      // Logging section
      const settings = await config.modules(interaction.guildId!);
      if (settings.moderator.logging) {
        if (!settings.moderator.loggingChannel) return;

        // Fetch the logging channel
        const logChannel = interaction.guild?.channels.cache.get(
          settings.moderator.loggingChannel
        );

        // Check if the logging channel exists
        if (!logChannel)
          throw new CustomError({
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          });

        // Send log message to the designated channel if sendable
        if (!logChannel.isSendable()) return;
        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.un({
              action: "Unmute",
              moderator: interaction.user,
              reason: reasonOption || "No reason provided",
              target: targetUser,
            }),
          ],
        });
      }

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "unmute",
  description: "Unmute a user",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The user to unmute",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the unmute",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissionsRequired: [PermissionFlagsBits.MuteMembers],
};

export default command;
