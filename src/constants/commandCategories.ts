export const commandCategories = Object.fromEntries(
  Object.entries({
    core: {
      label: "Core",
      emoji: "1387028267805970473",
      description: "Essential commands for bot functionality",
    },
    game: {
      label: "Game",
      emoji: "1387028452485496882",
      description: "Commands related to games and entertainment",
    },
    moderator: {
      label: "Moderator",
      emoji: "1387028452485496882",
      description: "Commands for server moderation and management",
    },
    music: {
      label: "Music",
      emoji: "1387030868937408512",
      description: "Commands for music playback and control",
    },
    miniGames: {
      label: "Mini Games",
      emoji: "1387029973566492774",
      description: "Commands for playing mini games",
    },
    tempVoice: {
      label: "Temporary Voice",
      emoji: "1387030156325163199",
      description: "Commands for temporary voice channels",
    },
    setup: {
      label: "Setup",
      emoji: "1387030397677731840",
      description: "Commands to setup the bot for your server",
    },
    settings: {
      label: "Settings",
      emoji: "1387030756974661693",
      description: "Commands to configure server settings",
    },
    userSettings: {
      label: "User Settings",
      emoji: "1387031121405022268",
      description: "Commands to configure user settings",
    },
    utils: {
      label: "Utils",
      emoji: "1387031915915251863",
      description: "Utility commands to enhance functionality",
    },
  }).sort(([, a], [, b]) => a.label.localeCompare(b.label))
);
