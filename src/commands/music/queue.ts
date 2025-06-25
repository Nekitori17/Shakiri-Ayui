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
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const queue = useQueue(interaction.guildId!);
      if (queue?.tracks.size == 0)
        throw {
          name: "NoQueue",
          message: "There is no queue to show",
        };

      const AMOUNT_TRACK_IN_PAGE = 10;
      const queuePartition: Track[][] = [];

      const tracksArray = queue?.tracks.toArray() || [];
      const totalTracks = tracksArray.length;

      const maxPages = Math.floor(totalTracks / AMOUNT_TRACK_IN_PAGE) || 1;
      const chunkSize = Math.ceil(totalTracks / maxPages);

      queuePartition.push(..._.chunk(tracksArray, chunkSize));

      let currentPage = 0;
      function createReply(page: number) {
        const buttonsPage = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder()
              .setCustomId("music-queue-page-previous")
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
          components: [buttonsPage],
        };
      }

      const reply = await interaction.editReply(createReply(currentPage));

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      collector.on("collect", async (inter) => {
        if (inter.customId === "music-queue-page-previous") {
          currentPage -= 1;
          reply.edit(createReply(currentPage));
          inter.deferUpdate();
        }

        if (inter.customId == "music-queue-page-current")
          return inter.deferUpdate();

        if (inter.customId === "music-queue-page-next") {
          currentPage += 1;
          reply.edit(createReply(currentPage));
          inter.deferUpdate();
        }
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "queue",
  description: "List tracks in queue",
  deleted: false,
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
