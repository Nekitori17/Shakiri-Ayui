import path from "path";
import type { ClientEvents } from "discord.js";
import ExtendedClient from "../classes/ExtendedClient";
import getAllFiles from "../helpers/loaders/getAllFiles";
import { errorLogger } from "../helpers/errors/handleError";
import { DiscordEventInterface } from "../types/EventInterfaces";

export default (client: ExtendedClient) => {
  const eventFolders = getAllFiles(
    path.join(__dirname, "../events/Discord"),
    true,
  );

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

    // Extract the event name from the folder name
    const eventName = eventFolder
      .replace(/\\/g, "/")
      .split("/")
      .pop() as keyof ClientEvents;

    try {
      client.on(eventName, (...args: unknown[]) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile)
            .default as DiscordEventInterface;
          eventFunction(client, ...args);
        }
      });
    } catch (error: any) {
      console.log(`\x1b[31m\x1b[1m|> ${error.name}\x1b[0m`);
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      errorLogger(error);
    }
  }
};
