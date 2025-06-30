/**
 *  Command categories and their properties. 
 */
 

export const commandCategories = Object.fromEntries(
  Object.entries({
    core: {
      label: "Core",
      emoji: "💻",
      description: "Essential commands for bot functionality",
    },
    game: {
      label: "Game",
      emoji: "🎮",
      description: "Commands related to games and entertainment",
    },
    moderator: {
      label: "Moderator",
      emoji: "👮",
      description: "Commands for server moderation and management",
    },
    music: {
      label: "Music",
      emoji: "🎶",
      description: "Commands for music playback and control",
    },
    miniGames: {
      label: "Mini Games",
      emoji: "🎲",
      description: "Commands for playing mini games",
    },
    tempVoice: {
      label: "Temporary Voice",
      emoji: "🎤",
      description: "Commands for temporary voice channels",
    },
    setup: {
      label: "Setup",
      emoji: "🔧",
      description: "Commands to setup the bot for your server",
    },
    settings: {
      label: "Settings",
      emoji: "⚙",
      description: "Commands to configure server settings",
    },
    userSettings: {
      label: "User Settings",
      emoji: "👤",
      description: "Commands to configure user settings",
    },
    utils: {
      label: "Utils",
      emoji: "🛠️",
      description: "Utility commands to enhance functionality",
    },
  }).sort(([, a], [, b]) => a.label.localeCompare(b.label))
);
