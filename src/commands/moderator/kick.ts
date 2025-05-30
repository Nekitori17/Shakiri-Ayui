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

      if (!targetUser)
        throw {
          name: "UserNotFound",
          message: "That user does not exist in this server",
        };

      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "Can'tKickOwner",
          message: "Why you would want to kick the owner of this server 🤨",
          type: "warning",
        };

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "Can'tKickMe",
          message: "Why you would want to kick me 😭",
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

      await targetUser.kick(reason);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🛴| **${targetUser.user.displayName}** has been kicked`,
            })
            .setDescription(`**Reason**: ${reason || "No reason provided"}`)
            .setColor("Orange"),
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
            ModerationEmbedBuilder.kick({
              target: targetUser,
              moderator: interaction.user,
              reason: reason || "No reason provided",
            }),
          ],
        });
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "kick",
  description: "kick a user",
  deleted: false,
  options: [
    {
      name: "target",
      description: "The target to kick",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  botPermissions: [PermissionFlagsBits.KickMembers],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
};

export default command;
