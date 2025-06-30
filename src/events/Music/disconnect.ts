import { TextChannel } from "discord.js";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("disconnect", (queue) => {
    // Delete shuffle state for the guild
    musicPlayerStoreSession.shuffled.del(queue.guild.id);
    // Delete loop state for the guild
    musicPlayerStoreSession.loop.del(queue.guild.id);
    // Delete volume state for the guild
    musicPlayerStoreSession.volume.del(queue.guild.id);

    // Send a message to the channel indicating the bot is leaving
    (queue.metadata.channel as TextChannel).send(
      "> <:colorhandpeace:1387288072030388307> | Looks like my job here is done. Leaving now!"
    );
  });
};

export default event; 
