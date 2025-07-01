import { TextChannel } from "discord.js";
import { MusicPlayerSession } from "../../musicPlayerStoreSession";
import { MusicEventInterface } from "../../types/EventInterfaces";

const event: MusicEventInterface = (player) => {
  player.events.on("disconnect", (queue) => {
    // Clear session data related to the music player for this guild
    const musicPlayerStoreSession = new MusicPlayerSession(queue.guild.id);
    musicPlayerStoreSession.clear();

    // Send a message to the channel indicating the bot is leaving
    (queue.metadata.channel as TextChannel).send(
      "> <:colorhandpeace:1387288072030388307> | Looks like my job here is done. Leaving now!"
    );
  });
};

export default event;
