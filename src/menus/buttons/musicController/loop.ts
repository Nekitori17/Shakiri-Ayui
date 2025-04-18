import {
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { QueueRepeatMode, useQueue } from "discord-player";
import sendError from "../../../helpers/sendError";
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
        await selectInteraction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const repeatMode = parseInt(
            selectInteraction.values[0]
          ) as QueueRepeatMode;

          queue.setRepeatMode(repeatMode);
          musicPlayerStoreSession.loop.set(interaction.guildId!, repeatMode);

          await selectInteraction.editReply(
            `🔁 Loop mode set to ${repeatModeNames[repeatMode]}`
          );
        } catch (error) {
          sendError(selectInteraction, error, true);
        }
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default button;
