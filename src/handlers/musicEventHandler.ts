import path from "path";
import getAllFiles from "../utils/getAllFiles";
import { Client } from "discord.js";
import { Player } from "discord-player";
import { MusicEventInterface } from "../types/EventInterfaces";

export default (client: Client, player: Player): void => {
  const eventFiles = getAllFiles(path.join(__dirname, "..", "events", "Music"));

  for (const eventFile of eventFiles) {
    const eventFunction = require(eventFile).default as MusicEventInterface;
    eventFunction(player, client)
  }
}