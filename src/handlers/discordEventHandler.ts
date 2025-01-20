import path from "path";
import getAllFiles from "../helpers/getAllFiles";
import { DiscordEventInterface } from "../types/EventInterfaces";

export default (client: any): void => {
  const eventFolders = getAllFiles(
    path.join(__dirname, "..", "events", "Discord"),
    true
  );

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
    try {
      client.on(eventName, (...args: any) => {
        for (const eventFile of eventFiles) {
          const eventFunction = (
            require(eventFile) as { default: DiscordEventInterface }
          ).default;
          eventFunction(client, ...args);
        }
      });
    } catch (error: { name: string; message: string } | any) {
      console.log(`\x1b[31m\x1b[1m|> ${error.name}\x1b[0m`);
      console.log(`\x1b[32m${error.message}\x1b[0m`);
    }
  }
};
