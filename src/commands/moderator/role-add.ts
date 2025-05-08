import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMemberRoleManager,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/sendError";
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
            "You cannot add a role that is higher than your highest role",
        };

      if (botRolePosition! < targetRolePosition) {
        throw {
          name: "RolePositionError",
          message: "I cannot add a role that is higher than my highest role",
        };
      }

      if (targetUser.roles.cache.has(targetRole.id))
        throw {
          name: "RoleAlreadyAdded",
          message: "That user already has that role",
        };

      await targetUser.roles.add(targetRole);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: targetUser.user.displayName,
              iconURL: targetUser.displayAvatarURL(),
            })
            .setColor("Green")
            .setTitle("Role Added")
            .setDescription(
              `Successfully Added the role ${targetRole} to ${targetUser}`
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
  name: "role-add",
  description: "Add a role to a user",
  deleted: false,
  options: [
    {
      name: "target",
      description: "The user to add the role to",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "role",
      description: "The role to add",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  botPermissions: [PermissionFlagsBits.KickMembers],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
};

export default command;
