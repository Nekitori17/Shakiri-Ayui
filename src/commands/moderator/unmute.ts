import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMemberRoleManager,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { ModerationEmbedBuilder } from "../../helpers/embeds/moderationEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const target = interaction.options.get("target")?.value as string;
    const reason = interaction.options.get("reason")?.value as string;

    try {
      const targetUser = await interaction.guild?.members.fetch(target);
      if (!targetUser?.isCommunicationDisabled())
        throw {
          name: "UserIsNotMuted",
          message: "This user is not muted",
        };

      if (!targetUser)
        throw {
          name: "UserNotFound",
          message: "That user does not exist in this server",
        };

      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "OwnerIsMuted?",
          message: "Nahhh. I don't think owner can be muted",
          type: "warning",
        };

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "OhhhMyGod...",
          message: "I even can't do that",
          type: "warning",
        };

      const requestUserRolePosition = (
        interaction.member?.roles as GuildMemberRoleManager
      ).highest.position;
      const targetUserRolePosition = targetUser.roles.highest.position;
      const botRolePosition =
        interaction.guild?.members.me?.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition)
        throw {
          name: "InsufficientPermissions",
          message: "They have the same/higher role than you",
          type: "warning",
        };

      if (targetUserRolePosition >= botRolePosition!)
        throw {
          name: "InsufficientPermissions",
          message: "They have the same/higher role than me",
          type: "warning",
        };

      await targetUser.timeout(null, reason);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🥶| **${targetUser.user.displayName}** has been unmuted`,
            })
            .setDescription(`**Reason**: ${reason || "No reason provided"}`)
            .setColor("Green"),
        ],
      });

      const settings = await config.modules(interaction.guildId!);
      if (settings.moderator.logging) {
        if (!settings.moderator.loggingChannel) return;

        const logChannel = interaction.guild?.channels.cache.get(
          settings.moderator.loggingChannel
        );

        if (!logChannel)
          throw {
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          };

        if (!logChannel.isSendable()) return;
        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.un({
              action: "Unmute",
              moderator: interaction.user,
              reason: reason || "No reason provided",
              target: targetUser,
            }),
          ],
        });
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "unmute",
  description: "Unmute a user",
  deleted: false,
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
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};

export default command;
