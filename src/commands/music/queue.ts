import _ from "lodash";
import {
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";
import { Track, useQueue } from "discord-player";
import { createPageNavigationMenu } from "../../components/pageNavigationMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const queue = useQueue(interaction.guildId!);
      if (queue?.tracks.size == 0)
        throw new client.CustomError({
          name: "NoQueue",
          message: "There is no queue to show",
        });

      const AMOUNT_TRACK_PER_PAGE = 10;
      const queuePartition: Track[][] = [];
      const tracksArray = queue?.tracks.toArray() || [];
      const totalTracks = tracksArray.length;

      // Calculate total number of pages
      const maxPages = Math.ceil(totalTracks / AMOUNT_TRACK_PER_PAGE) || 1;

      // Chunk tracks by the desired amount per page
      queuePartition.push(..._.chunk(tracksArray, AMOUNT_TRACK_PER_PAGE));

      let currentPage = 0;
      function createReply(page: number) {
        const buttonsPageRow = createPageNavigationMenu(
          page,
          maxPages,
          "music-queue",
        );

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
                        70,
                      )}${track.title.length > 70 ? "..." : ""} - \`${
                        track.duration
                      }\`\n*by ${track.author}*`,
                  )
                  .join("\n\n"),
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

      const queueEmbedReply = await interaction.editReply(
        createReply(currentPage),
      );

      const queueEmbedCollector =
        queueEmbedReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      queueEmbedCollector.on(
        "collect",
        async (queuePageNavButtonInteraction) => {
          if (
            queuePageNavButtonInteraction.customId == "music-queue-page-current"
          )
            return queuePageNavButtonInteraction.deferUpdate();

          if (
            queuePageNavButtonInteraction.customId === "music-queue-page-prev"
          ) {
            currentPage -= 1;
            queueEmbedReply.edit(createReply(currentPage));
            queuePageNavButtonInteraction.deferUpdate();
          }

          if (
            queuePageNavButtonInteraction.customId === "music-queue-page-next"
          ) {
            currentPage += 1;
            queueEmbedReply.edit(createReply(currentPage));
            queuePageNavButtonInteraction.deferUpdate();
          }
        },
      );

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["qe"],
  name: "queue",
  description: "List tracks in queue",
  deleted: false,
  devOnly: false,
  disabled: false,
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
