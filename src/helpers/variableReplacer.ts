import { Client, Guild, GuildMember, User } from "discord.js";

/**
 *
 * Replace variable in string with value
 * Available variable:
 * - user.id
 * - user.displayName
 * - user.username
 * - user (Mention)
 * - user.avatar
 * - guild.name
 * - guild.id
 * - guild.count
 * - guild.icon
 * - client.id
 * - client.tag
 * - client.displayName
 * - client (Mention)
 * - client.avatar
 *
 * Example:
 * ```
 * const str = "Welcome {user} to {guild.name}!";
 * const replacedStr = await genericVariableReplacer(str, user, guild, client);
 * ```
 *
 * @param str Input string include variable with syntax {VARIABLE}
 * @param user Discord user
 * @param guild Discord guild
 * @param client Discord client
 */
export function genericVariableReplacer(
  str: string,
  user: User | GuildMember,
  guild: Guild,
  client: Client
) {
  const variables: { [key: string]: string } = {
    user: `<@${user.id}>`,
    "user.id": user.id,
    "user.displayName": user.displayName,
    "user.username": user instanceof User ? user.username : user.user.username,
    "user.avatar": user.displayAvatarURL(),
    "guild.name": guild.name,
    "guild.id": guild.id,
    "guild.count": guild.memberCount.toString(),
    "guild.icon": guild.iconURL() ?? "",
    client: client.user ? `<@${client.user?.id}>` : "",
    "client.id": client.user?.id ?? "",
    "client.tag": client.user?.tag ?? "",
    "client.displayName": client.user?.displayName ?? "",
    "client.avatar": client.user?.displayAvatarURL() ?? "",
  };

  let replacedStr = str;
  for (const key in variables) {
    const regex = new RegExp(`{${key}}`, "g");
    replacedStr = replacedStr.replace(regex, variables[key]);
  }

  return replacedStr;
}
