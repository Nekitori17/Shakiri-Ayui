import { PermissionFlagsBits } from "discord.js";
import GuildSettings from "./models/GuildSettings";

export default {
  modules: async (guildId: string) => {
    return await GuildSettings.findOneAndUpdate(
      { guildId },
      { $setOnInsert: { guildId } },
      {
        upsert: true,
        new: true,
      }
    );
  },
  statusIntervalTime: 10000,
  defaultPermissions: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
  ],
};
