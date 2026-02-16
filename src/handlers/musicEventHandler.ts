import path from "path";
import ExtendedClient from "../classes/ExtendedClient";
import { Player } from "discord-player";
import getAllFiles from "../helpers/loaders/getAllFiles";
import { errorLogger } from "../helpers/errors/handleError";
import { MusicEventInterface } from "../types/EventInterfaces";


export default (client: ExtendedClient, player: Player) => {
  try {
    const eventFiles = getAllFiles(path.join(__dirname, "../events/Music"));

    for (const eventFile of eventFiles) {
      const eventFunction = require(eventFile).default as MusicEventInterface;
      eventFunction(player, client);
    }
  } catch (error) {
    errorLogger(error);
  }
};
