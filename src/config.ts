import { ActivityType, PermissionFlagsBits, PresenceData } from "discord.js";

export default {
  presenceRotateList: [
    {
      activities: [
        {
          name: `/help`,
          type: ActivityType.Listening,
        },
      ],
      status: "online",
    },
    {
      activities: [
        {
          name: `I'm the cutest bot`,
          type: ActivityType.Watching,
        },
      ],
      status: "idle",
    },
    {
      activities: [
        {
          name: `Developed by Nekitori17`,
          type: ActivityType.Competing,
        },
      ],
      status: "dnd",
    },
  ] as PresenceData[],
  defaultPrefix: "a.",
  presenceIntervalTime: 10000,
  geminiAI: {
    model: "gemini-3-pro-preview",
  },
  defaultBotPermissionsRequired: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
  ],
};
