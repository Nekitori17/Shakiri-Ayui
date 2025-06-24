import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { QueueRepeatMode, useQueue } from "discord-player";
import sendError from "../../../helpers/utils/sendError";
import { musicPlayerStoreSession } from "../../../musicPlayerStoreSession";
import { repeatModeNames } from "../../../constants/musicRepeatModes";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to resume",
        };

      const loopModeSelectMenu = Object.entries(repeatModeNames).map((mode) =>
        new StringSelectMenuOptionBuilder().setLabel(mode[1]).setValue(mode[0])
      );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("music-controller-set-loop-mode")
          .setPlaceholder("Select a loop mode")
          .addOptions(loopModeSelectMenu)
      );

      const sent = await interaction.editReply({
        content: "Select a loop mode",
        components: [row],
      });

      const collector = sent.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 15000,
      });

      collector.on("collect", async (selectInteraction) => {
        await selectInteraction.deferReply();

        try {
          const repeatMode = parseInt(
            selectInteraction.values[0]
          ) as QueueRepeatMode;

          queue.setRepeatMode(repeatMode);
          musicPlayerStoreSession.loop.set(interaction.guildId!, repeatMode);

          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: `<:neonmusic:1387059800721981473> Set loop mode to ${repeatModeNames[repeatMode]}`,
                  iconURL: "https://img.icons8.com/fluency/512/repeat.png",
                })
                .setColor("#5a01ff"),
            ],
          });
        } catch (error) {
          sendError(selectInteraction, error);
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
