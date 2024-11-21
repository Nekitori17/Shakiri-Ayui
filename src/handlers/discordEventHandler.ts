import path from "path";
import getAllFiles from "../utils/getAllFiles";
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
    client.on(eventName, (args: any) => {
      for (const eventFile of eventFiles) {
        const eventFunction = (
          require(eventFile) as { default: DiscordEventInterface }
        ).default;
        eventFunction(client, args);
      }
    });
  }
};
