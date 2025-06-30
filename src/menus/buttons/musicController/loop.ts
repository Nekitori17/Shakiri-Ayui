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

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw {
          name: "NoQueue",
          message: "There is no queue to resume",
        };

      // Create options for the loop mode select menu
      const loopModeSelectMenuOption = Object.entries(repeatModeNames).map(
        (mode) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(mode[1])
            .setValue(mode[0])
      );

      // Create the select menu for loop modes
      const loopModeSelectMenuRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("music-controller-set-loop-mode")
            .setPlaceholder("Select a loop mode")
            .addOptions(loopModeSelectMenuOption)
        );

      // Send the reply with the select menu
      const loopModeMenuReply = await interaction.editReply({
        content: "Select a loop mode",
        components: [loopModeSelectMenuRow],
      });

      // Create a collector for the select menu interaction
      const loopModeMenuCollector =
        loopModeMenuReply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id,
          time: 15000,
        });

      // Handle collection of a select menu interaction
      loopModeMenuCollector.on("collect", async (loopModeSelectInteraction) => {
        try {
          await loopModeSelectInteraction.deferReply();

          // Get the selected repeat mode from the interaction
          const repeatMode = parseInt(
            loopModeSelectInteraction.values[0]
          ) as QueueRepeatMode;

          // Set the repeat mode for the queue and store it in session
          queue.setRepeatMode(repeatMode);
          musicPlayerStoreSession.loop.set(interaction.guildId!, repeatMode);

          // Edit the reply to confirm the loop mode change
          loopModeMenuReply.edit({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: `🎶 Set loop mode to ${repeatModeNames[repeatMode]}`,
                  iconURL: "https://img.icons8.com/fluency/512/repeat.png",
                })
                .setColor("#5a01ff"),
            ],
            components: [],
          });
        } catch (error) {
          sendError(loopModeSelectInteraction, error);
        }
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
