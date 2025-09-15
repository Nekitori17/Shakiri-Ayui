import { ActivityType, PermissionFlagsBits, PresenceData } from "discord.js";
import GuildSettings from "./models/GuildSettings";


const config = {
  modules: async (guildId: string) => {
    return await GuildSettings.findOneAndUpdate(
      { guildId },
      { $setOnInsert: { guildId } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  },
  prefix: "a!",
  presenceRotateList: [] as PresenceData[],
  presenceIntervalTime: 10000,
  geminiAI: {
    model: "gemini-2.5-pro"
  },
  defaultBotPermissionsRequired: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
  ],
};

const presenceRotateList: PresenceData[] = [
  {
    activities: [{
      name: `${config.prefix}help | /help`,
      type: ActivityType.Listening,
    }],
    status: "online",
  },
  {
    activities: [{
      name: `I'm the cutest bot`,
      type: ActivityType.Watching,
    }],
    status: "idle",
  },
  {
    activities: [{
      name: `Developed by Nekitori17`,
      type: ActivityType.Competing,
    }],
    status: "dnd",
  },
];

config.presenceRotateList = presenceRotateList;

export default config;
