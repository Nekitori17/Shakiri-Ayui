import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { useQueue } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
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
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Are you sure you want to stop the queue?",
              iconURL: "https://img.icons8.com/fluency/512/question-mark.png",
            })
            .setColor("#fbff00"),
        ],
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
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: "🎶 Queue has been stopped!",
                    iconURL:
                      "https://img.icons8.com/color/512/do-not-disturb.png",
                  })
                  .setColor("#ff3131"),
              ],
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
