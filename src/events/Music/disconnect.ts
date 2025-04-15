import { TextChannel } from "discord.js";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";

const event: MusicEventInterface = (player) => {
  player.events.on("disconnect", (queue) => {
    musicPlayerStoreSession.shuffeld.del(queue.guild.id);
    musicPlayerStoreSession.loop.del(queue.guild.id);
    musicPlayerStoreSession.volume.del(queue.guild.id);

    (queue.metadata.channel as TextChannel).send(
      "> ✌ | Looks like my job here is done. Leaving now!"
    );
  });
};

export default event;
