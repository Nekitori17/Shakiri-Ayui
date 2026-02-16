import { Client } from "discord.js";

export default async (client: Client, guildId?: string) => {
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    return await guild.commands.fetch();
  }

  return await client.application?.commands.fetch();
};
