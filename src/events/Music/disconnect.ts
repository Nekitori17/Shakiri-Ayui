import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { TextChannel } from "discord.js";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("disconnect", (queue) => {
    (queue.metadata.channel as TextChannel).send("> ✌ | Looks like my job here is done. Leaving now!");
  });
};

export default event