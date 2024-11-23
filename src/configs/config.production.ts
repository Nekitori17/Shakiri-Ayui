import { PermissionFlagsBits } from "discord.js";

export default {
  modules: {
    music: {
      volume: 75,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 60000,
      leaveOnEnd: true,
      leaveOnEndCooldown: 60000,
    },
    moderator: {
      logging: true,
      loggingChannel: "1134670264270061640",
    },
    geminiAI: {
      ignorePrefix: "!",
      channelSet: "1121010857778876467",
    },
    welcomer: {
      channelSend: "1120996521396150342",
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
