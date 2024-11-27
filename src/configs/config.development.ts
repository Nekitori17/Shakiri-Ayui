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
    countingGame: {
      channelSet: "1310036246344630352",
      numberStart: 1
    },
    temporaryVoiceChannel: {
      nameChannelSyntax: "{username}'s Voice",
      channelSet: "1311278510240694302",
      categorySet: "1202978247126552616"
    }
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
