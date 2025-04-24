import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
import { musicPlayerStoreSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to stop",
        };

      const confirmButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("stop-confirm-yes")
          .setLabel("Yes")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("stop-confirm-no")
          .setLabel("No")
          .setStyle(ButtonStyle.Danger)
      );

      const sent = await interaction.editReply({
        content: "> Are you sure you want to stop the queue?",
        components: [confirmButton],
      });

      const collector = sent.createMessageComponentCollector({
        time: 30000,
      });

      collector.on("collect", async (buttonInteraction) => {
        try {
          if (buttonInteraction.customId === "stop-confirm-no") sent.delete();

          if (buttonInteraction.customId === "stop-confirm-yes") {
            sent.edit({
              content: "> The queue has been stopped!",
              components: [],
            });

            queue.delete();
            
            musicPlayerStoreSession.shuffeld.del(queue.guild.id);
            musicPlayerStoreSession.loop.del(queue.guild.id);
            musicPlayerStoreSession.volume.del(queue.guild.id);
          }
        } catch (error) {
          sendError(interaction, error);
        }
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
