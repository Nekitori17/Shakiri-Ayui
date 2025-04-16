import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Track, useQueue } from "discord-player";
import sendError from "../../helpers/sendError";
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
      let currentPage = 0;
      const tracksArray = queue?.tracks.toArray() || [];
      const maxPage = Math.ceil(tracksArray.length / AMOUNT_TRACK_IN_PAGE);
      for (let i = 0; i < maxPage; i++) {
        queuePartition.push(
          tracksArray.slice(
            i * AMOUNT_TRACK_IN_PAGE,
            (i + 1) * AMOUNT_TRACK_IN_PAGE
          )
        );
      }

      function createReply(page: number) {
        const buttonsPage = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder()
              .setCustomId("music-queue-page-previous")
              .setEmoji("⬅️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("music-queue-page-current")
              .setLabel(`${page + 1}/${maxPage}`)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("music-queue-page-next")
              .setEmoji("➡️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPage - 1),
          ],
        });
        return {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTitle("> 🎶 Queue")
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
