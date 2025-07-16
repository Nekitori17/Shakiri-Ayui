import _ from "lodash";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Track, useQueue } from "discord-player";
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      // Get the music queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists or it's empty, throw an error
      if (queue?.tracks.size == 0)
        throw new CustomError({
          name: "NoQueue",
          message: "There is no queue to show",
        });

      // Define the number of tracks to display per page
      const AMOUNT_TRACK_IN_PAGE = 10;
      // Initialize an array to store tracks partitioned into pages
      const queuePartition: Track[][] = [];

      // Get all tracks in the queue and calculate total tracks
      const tracksArray = queue?.tracks.toArray() || [];
      const totalTracks = tracksArray.length;

      // Calculate the maximum number of pages and chunk size for partitioning
      const maxPages = Math.floor(totalTracks / AMOUNT_TRACK_IN_PAGE) || 1;
      const chunkSize = Math.ceil(totalTracks / maxPages);

      queuePartition.push(..._.chunk(tracksArray, chunkSize));

      let currentPage = 0;
      /**
       * Creates a reply object containing an EmbedBuilder and ActionRowBuilder for displaying the music queue.
       * @param page The current page number to display.
       * @returns An object with `embeds` and `components` properties.
       */
      function createReply(page: number) {
        // Create navigation buttons for the queue pages
        const buttonsPageRow = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder()
              .setCustomId("music-queue-page-prev")
              .setEmoji("1387296301867073576")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("music-queue-page-current")
              .setLabel(`${page + 1}/${maxPages}`)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("music-queue-page-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page >= maxPages - 1),
          ],
        });
        // Return the embed and components for the current page
        return {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTitle("> <:colorplaylist:1387285287872237719> Queue")
              .setDescription(
                queuePartition[page]
                  .map(
                    (track, index) =>
                      `**${page * 10 + index + 1}.** ${track.title.substring(
                        0,
                        70
                      )}${track.title.length > 70 ? "..." : ""} - \`${
                        track.duration
                      }\`\n*by ${track.author}*`
                  )
                  .join("\n\n")
              )
              .setFooter({
                text: interaction.guild?.name!,
              })
              .setTimestamp()
              .setColor("#00ffc8"),
          ],
          components: [buttonsPageRow],
        };
      }

      // Send the initial reply with the first page of the queue
      const queueEmbedReply = await interaction.editReply(
        createReply(currentPage)
      );

      // Create a message component collector for button interactions
      const queueEmbedCollector =
        queueEmbedReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      // Handle interactions from the queue navigation buttons
      queueEmbedCollector.on(
        "collect",
        async (queuePageNavButtonInteraction) => {
          // If 'current' button is clicked, just defer update (no change)
          if (
            queuePageNavButtonInteraction.customId == "music-queue-page-current"
          )
            return queuePageNavButtonInteraction.deferUpdate();

          // If 'previous' button is clicked, decrement page and update reply
          if (
            queuePageNavButtonInteraction.customId === "music-queue-page-prev"
          ) {
            currentPage -= 1;
            queueEmbedReply.edit(createReply(currentPage));
            queuePageNavButtonInteraction.deferUpdate();
          }

          // If 'next' button is clicked, increment page and update reply
          if (
            queuePageNavButtonInteraction.customId === "music-queue-page-next"
          ) {
            currentPage += 1;
            queueEmbedReply.edit(createReply(currentPage));
            queuePageNavButtonInteraction.deferUpdate();
          }
        }
      );

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "qe",
  name: "queue",
  description: "List tracks in queue",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
