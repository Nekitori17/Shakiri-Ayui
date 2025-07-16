import path from "path";
import getAllFiles from "../helpers/utils/getAllFiles";
import { errorLogger } from "../helpers/utils/handleError";
import { DiscordEventInterface } from "../types/EventInterfaces";

export default (client: any) => {
  // Get all event folders
  const eventFolders = getAllFiles(
    path.join(__dirname, "..", "events", "Discord"),
    true
  );

  // Loop through each event folder
  for (const eventFolder of eventFolders) {
    // Get all event files within the current folder
    const eventFiles = getAllFiles(eventFolder);
    // Sort event files alphabetically
    eventFiles.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

    // Extract the event name from the folder name
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
    try {
      // Register the event listener for the extracted event name
      client.on(eventName, (...args: any) => {
        // Execute each event function within the event folder
        for (const eventFile of eventFiles) {
          const eventFunction = (
            require(eventFile) as { default: DiscordEventInterface }
          ).default;
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
