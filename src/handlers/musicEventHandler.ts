import path from "path";
import { Client } from "discord.js";
import { Player } from "discord-player";
import getAllFiles from "../helpers/utils/getAllFiles";
import { MusicEventInterface } from "../types/EventInterfaces";

export default (client: Client, player: Player): void => {
  // Get all music event files
  const eventFiles = getAllFiles(path.join(__dirname, "..", "events", "Music"));

  // Loop through each music event file
  for (const eventFile of eventFiles) {
    // Require the event function and execute it
    const eventFunction = require(eventFile).default as MusicEventInterface;
    eventFunction(player, client)
  }
}