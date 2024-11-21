import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { TextChannel } from "discord.js";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("playerError", (queue, error, track) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        CommonEmbedBuilder.error({
          title: `⚠ | ${error.name}`,
          description: error.message,
          footer: `Track: ${track.title}`,
        }),
      ],
    });
  });
};

export default event;
