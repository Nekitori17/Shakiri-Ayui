import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { QueueRepeatMode, useQueue } from "discord-player";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { repeatModeNames } from "../../../constants/musicRepeatModes";
import { MusicPlayerSession } from "../../../musicPlayerStoreSession";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const button: ButtonInterface = {
  async execute(interaction, client) {
    const controlPanelButtonIn = interaction.message.content.includes("\u200B");

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      if (!queue)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to resume",
        });

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
        content: "<:colorsynchronize:1387283489883164733> Select a loop mode",
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
          await loopModeSelectInteraction.deferReply({
            flags: controlPanelButtonIn ? MessageFlags.Ephemeral : undefined,
          });

          // Get the selected repeat mode from the interaction
          const repeatMode = parseInt(
            loopModeSelectInteraction.values[0]
          ) as QueueRepeatMode;

          // Set the repeat mode for the queue and store it in session
          queue.setRepeatMode(repeatMode);
          const musicPlayerStoreSession = new MusicPlayerSession(
            interaction.guildId!
          );
          musicPlayerStoreSession.setRepeatMode(repeatMode);

          // Edit the reply to confirm the loop mode change
          loopModeSelectInteraction.editReply({
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
          handleInteractionError(loopModeSelectInteraction, error, controlPanelButtonIn);
        }
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error, controlPanelButtonIn);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
