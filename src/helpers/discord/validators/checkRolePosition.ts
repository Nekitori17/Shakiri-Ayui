import {
  APIInteractionGuildMember,
  APIRole,
  Guild,
  GuildMember,
  Role,
} from "discord.js";
import { CustomError } from "../../errors/CustomError";

/**
 * Retrieves the highest role position (largest numerical value) of a member within a guild.
 */
async function getHighestRolePosition(
  member: APIInteractionGuildMember,
  guild: Guild,
) {
  if (!member.roles?.length) return 0;

  const roles = await Promise.all(
    member.roles.map(async (roleId) => {
      // Try cache first
      const cached = guild.roles.cache.get(roleId);
      if (cached) return cached;

      // Fallback to fetch
      try {
        return await guild.roles.fetch(roleId);
      } catch {
        return null;
      }
    }),
  );

  const validRoles = roles.filter((role): role is Role => role !== null);

  if (!validRoles.length) return 0;

  return Math.max(...validRoles.map((r) => r.position));
}

/**
 * Checks if the user and bot have higher role positions than the target member.
 */
export async function checkUserRolePosition(
  userMember: GuildMember | APIInteractionGuildMember,
  botMember: GuildMember,
  targetMember: GuildMember,
) {
  const guild = targetMember.guild;

  const userRolePosition =
    userMember instanceof GuildMember
      ? userMember.roles.highest.position
      : await getHighestRolePosition(userMember, guild);

  const botRolePosition = botMember.roles.highest.position;
  const targetRolePosition = targetMember.roles.highest.position;

  if (targetRolePosition >= userRolePosition) {
    throw new CustomError({
      name: "InsufficientPermissions",
      message: "They have the same or higher role than you",
      type: "warning",
    });
  }

  if (targetRolePosition >= botRolePosition) {
    throw new CustomError({
      name: "InsufficientPermissions",
      message: "They have the same or higher role than me",
      type: "warning",
    });
  }
}

/**
 * Checks if the user and bot have higher role positions than the target role.
 */
export async function checkRolePosition(
  userMember: GuildMember | APIInteractionGuildMember,
  botMember: GuildMember,
  targetRole: Role | APIRole,
  guild: Guild,
) {
  const userRolePosition =
    userMember instanceof GuildMember
      ? userMember.roles.highest.position
      : await getHighestRolePosition(userMember, guild);

  const botRolePosition = botMember.roles.highest.position;
  const targetRolePosition = targetRole.position;

  if (targetRolePosition >= userRolePosition) {
    throw new CustomError({
      name: "RolePositionError",
      message: "This role is higher than your highest role",
      type: "warning",
    });
  }

  if (targetRolePosition >= botRolePosition) {
    throw new CustomError({
      name: "RolePositionError",
      message: "This role is higher than my highest role",
      type: "warning",
    });
  }
}
