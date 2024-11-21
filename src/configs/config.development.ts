import { PermissionFlagsBits } from "discord.js";

export default {
  modules: {
    music: {
      volume: 75,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 30000,
      leaveOnEnd: true,
      leaveOnEndCooldown: 30000,
    },
    moderator: {
      logging: true,
      loggingChannel: "1251835240003932190",
    },
    geminiAI: {
      ignorePrefix: "!",
      channelSet: "1257870639226814494",
    },
    welcomer: {
      channelSend: "1202976692230946866",
      backgroundImage: "https://i.ibb.co/BnCqSH0/banner.jpg",
    },
  },
  setting: {
    statusIntervalTime: 10000,
    defaultPermissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.AttachFiles,
    ],
  },
};
