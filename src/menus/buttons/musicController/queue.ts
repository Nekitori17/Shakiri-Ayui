import _ from "lodash";
import {
  ComponentType,
  EmbedBuilder
} from "discord.js";
import { useQueue } from "discord-player";
import { ButtonInterface } from "./../../../types/InteractionInterfaces";
import { createPageNavigationMenu } from "../../../components/pageNavigationMenu";

const button: ButtonInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // Get the queue for the current guild
      const queue = useQueue(interaction.guildId!);
      // If no queue exists or it's empty, throw a custom error
      if (!queue || queue.tracks.size === 0) {
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to show",
        });
      }

      // Define the number of tracks per page and chunk the tracks array
      // Calculate the maximum number of pages
      const AMOUNT_TRACK_IN_PAGE = 10;
      const tracksArray = queue.tracks.toArray();
      const queuePartition = _.chunk(tracksArray, AMOUNT_TRACK_IN_PAGE);
      const maxPages = queuePartition.length || 1;

      let currentPage = 0;

      /**
       * Creates an embed and action row for displaying a page of the music queue.
       * @param page The current page number to display.
       * @returns An object containing the embed and components for the reply.
       */
      const createReply = (page: number) => {
        const embed = new EmbedBuilder()
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
                    70,
                  )}${track.title.length > 70 ? "..." : ""} - \`${
                    track.duration
                  }\`\n*by ${track.author}*`,
              )
              .join("\n\n"),
          )
          .setFooter({ text: interaction.guild?.name! })
          .setTimestamp()
          .setColor("#00ffc8");

        // Create action row with pagination buttons
        const row = createPageNavigationMenu(
          page,
          maxPages,
          "music-queue-page",
        );

        return {
          embeds: [embed],
          components: [row],
        };
      };

      // Send the initial reply with the first page of the queue
      const queueEmbedReply = await interaction.editReply(
        createReply(currentPage),
      );

      // Create a collector for button interactions on the queue embed
      const queueEmbedCollector =
        queueEmbedReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      queueEmbedCollector.on("collect", async (queueButtonInteraction) => {
        // Defer the update to the button interaction
        await queueButtonInteraction.deferUpdate();

        // Handle pagination logic based on button customId
        if (
          queueButtonInteraction.customId === "music-queue-page-prev" &&
          currentPage > 0
        ) {
          currentPage--;
        } else if (
          queueButtonInteraction.customId === "music-queue-page-next" &&
          currentPage < maxPages - 1
        ) {
          currentPage++;
        } else {
          return;
        }

        // Edit the original reply with the updated page
        await interaction.editReply(createReply(currentPage));
      });

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default button;
