import { Client, Guild, GuildMember, User } from "discord.js";

/**
 * Format variable placeholders in a string with actual Discord values.
 *
 * Supported variables:
 * - `{user}`: Mention format of the user.
 * - `{user.id}`: User's ID.
 * - `{user.displayName}`: Display name (nickname or username).
 * - `{user.username}`: Username only (not nickname).
 * - `{user.avatar}`: User's avatar URL.
 * - `{guild.name}`: Server (guild) name.
 * - `{guild.id}`: Server ID.
 * - `{guild.count}`: Member count.
 * - `{guild.icon}`: Server icon URL.
 * - `{client}`: Mention format of the bot.
 * - `{client.id}`: Bot user ID.
 * - `{client.tag}`: Bot username with discriminator (e.g., Shakiri#1234).
 * - `{client.displayName}`: Bot display name.
 * - `{client.avatar}`: Bot avatar URL.
 *
 * @example
 * const str = "Welcome {user} to {guild.name}!";
 * const formattedStr = await genericVariableFormatter(str, user, guild, client);
 *
 * @param str - Input string containing variables like `{user}`, `{guild.name}` etc.
 * @param user - The Discord user or guild member to pull user info from.
 * @param guild - The guild (server) where the context happens.
 * @param client - The Discord bot client instance.
 * @returns A string with all supported variables replaced by actual values.
 */
export function genericVariableFormatter(
  str: string,
  user: User | GuildMember,
  guild: Guild,
  client: Client
) {
  const variables: { [key: string]: string } = {
    // User-related variables
    user: `<@${user.id}>`,
    "user.id": user.id,
    "user.displayName": user.displayName,
    "user.username": user instanceof User ? user.username : user.user.username,
    "user.avatar": user.displayAvatarURL(),

    // Guild-related variables
    "guild.name": guild.name,
    "guild.id": guild.id,
    "guild.count": guild.memberCount.toString(),
    "guild.icon": guild.iconURL() ?? "",

    // Client(bot)-related variables
    client: client.user ? `<@${client.user.id}>` : "",
    "client.id": client.user?.id ?? "",
    "client.tag": client.user?.tag ?? "",
    "client.displayName": client.user?.displayName ?? "",
    "client.avatar": client.user?.displayAvatarURL() ?? "",
  };

  let formattedStr = str;
  for (const key in variables) {
    const regex = new RegExp(`{${key}}`, "g");
    formattedStr = formattedStr.replace(regex, variables[key]);
  }

  return formattedStr;
}
