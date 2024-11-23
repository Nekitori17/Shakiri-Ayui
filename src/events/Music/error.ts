import { Player } from "discord-player";
import { MusicEventInterface } from "../../types/EventInterfaces";
import { TextChannel } from "discord.js";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";

const event: MusicEventInterface = (player: Player) => {
  player.events.on("error", (queue, error) => {
    (queue.metadata.channel as TextChannel).send({
      embeds: [
        CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  });
};

export default event;
