import {
  APIInteractionGuildMember,
  APIRole,
  Guild,
  GuildMember,
  Role,
} from "discord.js";
import { CustomError } from "../helpers/utils/CustomError";

/**
 * Retrieves the highest role position (lowest numerical value) of a member within a guild.
 * @param member The APIInteractionGuildMember object representing the member.
 * @param guild The Guild object where the member belongs.
 * @returns A Promise that resolves to the highest role position of the member.
 */
async function getHighestRolePosition(
  member: APIInteractionGuildMember,
  guild: Guild
) {
  // Fetch all roles for the given member from the guild
  const roles = await Promise.all(
    member.roles.map((roleId) => guild.roles.fetch(roleId))
  );

  // Initialize highestPosition with a very large number
  let highestPosition = Infinity;

  // Iterate through the fetched roles to find the one with the highest position (lowest numerical value)
  for (const role of roles) {
    // If the role exists and its position is less than the current highestPosition, update highestPosition
    if (role && role.position < highestPosition) {
      highestPosition = role.position;
    }
  }

  return highestPosition;
}

/**
 * Checks if the user and bot have a higher role position than the target member.
 * Throws an error if the user or bot does not have a higher role.
 * @param userMember The GuildMember or APIInteractionGuildMember of the user initiating the action.
 * @param botMember The GuildMember of the bot.
 * @param targetMember The GuildMember of the target user.
 * @throws {object} An error object with `name`, `message`, and `type` if permissions are insufficient.
 */
export async function checkUserRolePosition(
  userMember: GuildMember | APIInteractionGuildMember,
  botMember: GuildMember,
  targetMember: GuildMember
) {
  // Get the highest role position for the user, bot, and target members
  const userRolePosition =
    userMember instanceof GuildMember
      ? userMember.roles.highest.position
      : await getHighestRolePosition(userMember, targetMember.guild);
  const botRolePosition = botMember?.roles.highest.position || Infinity;
  const targetRolePosition = targetMember.roles.highest.position;

  // Check if the command user has a higher role than the target
  if (targetRolePosition >= userRolePosition)
    throw new CustomError({
      name: "InsufficientPermissions",
      message: "They have the same/higher role than you",
      type: "warning",
    });

  // Check if the bot has a higher role than the target
  if (targetRolePosition >= botRolePosition)
    throw new CustomError({
      name: "InsufficientPermissions",
      message: "They have the same/higher role than me",
      type: "warning",
    });
}

export async function checkRolePosition(
  userMember: GuildMember | APIInteractionGuildMember,
  botMember: GuildMember,
  targetRole: Role | APIRole,
  guild: Guild
) {
  // Get the highest role position for the user, bot, and target role
  const userRolePosition =
    userMember instanceof GuildMember
      ? userMember.roles.highest.position
      : await getHighestRolePosition(userMember, guild);
  const botRolePosition = botMember?.roles.highest.position || Infinity;
  const targetRolePosition = targetRole.position;

  // Check if the command user has a higher role than the target role
  if (targetRolePosition >= userRolePosition)
    throw new CustomError({
      name: "RolePositionError",
      message: "You cannot add a role that is higher than your highest role",
      type: "warning",
    });

  // Check if the bot has a higher role than the target role
  if (targetRolePosition >= botRolePosition)
    throw new CustomError({
      name: "RolePositionError",
      message: "I cannot add a role that is higher than my highest role",
      type: "warning",
    });
}
