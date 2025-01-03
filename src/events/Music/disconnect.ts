import { TextChannel } from "discord.js";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("disconnect", (queue) => {
    (queue.metadata.channel as TextChannel).send("> ✌ | Looks like my job here is done. Leaving now!");
  });
};

export default event