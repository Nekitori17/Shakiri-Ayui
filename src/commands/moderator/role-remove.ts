import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMemberRoleManager,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const target = interaction.options.get("target")?.value as string;
    const role = interaction.options.get("role")?.value as string;

    try {
      const targetUser = await interaction.guild?.members.fetch(target);
      const targetRole = await interaction.guild?.roles.fetch(role);

      if (!targetUser)
        throw {
          name: "UserNotFound",
          message: "That user does not exist in this server",
        };

      if (!targetRole)
        throw {
          name: "RoleNotFound",
          message: "That role does not exist in this server",
        };

      const requestUserRolePosition = (
        interaction.member?.roles as GuildMemberRoleManager
      ).highest.position;
      const targetRolePosition = targetRole.position;
      const botRolePosition =
        interaction.guild?.members.me?.roles.highest.position;

      if (requestUserRolePosition < targetRolePosition)
        throw {
          name: "RolePositionError",
          message:
            "You cannot remove a role that is higher than your highest role",
        };

      if (botRolePosition! < targetRolePosition) {
        throw {
          name: "RolePositionError",
          message: "I cannot remove a role that is higher than my highest role",
        };
      }

      if (!targetUser.roles.cache.has(targetRole.id))
        throw {
          name: "RoleNotAssigned",
          message: "That user does not have that role",
        };

      await targetUser.roles.remove(targetRole);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: targetUser.user.displayName,
              iconURL: targetUser.displayAvatarURL(),
            })
            .setColor("Orange")
            .setTitle("Role removed")
            .setDescription(
              `Successfully removed the role ${targetRole} from ${targetUser}`
            )
            .setFooter({
              text: `Requested by ${interaction.user.tag}`,
            }),
        ],
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "role-remove",
  description: "Remove a role from a user",
  deleted: false,
  options: [
    {
      name: "target",
      description: "The user to remove the role from",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "role",
      description: "The role to remove from the user",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  botPermissions: [PermissionFlagsBits.KickMembers],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
};

export default command;
