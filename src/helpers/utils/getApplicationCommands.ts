import { Client } from "discord.js";

export default async (client: Client, guildId?: string) => {
  // If a guildId is provided, fetch commands for that specific guild.
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    return await guild.commands.fetch();
  }

  // Otherwise, fetch global application commands.
  return await client.application?.commands.fetch();
};
