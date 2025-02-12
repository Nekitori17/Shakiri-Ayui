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
          name: "No Queue",
          message: "There is no queue to show",
        };

      const queuePartition: Track[][] = [];
      let currentPage = 0;
      const tracksArray = queue?.tracks.toArray() || [];
      const maxPage = Math.ceil(tracksArray.length / 10);
      for (let i = 0; i < maxPage; i++) {
        queuePartition.push(tracksArray.slice(i * 10, (i + 1) * 10));
      }

      function createReply(page: number) {
        const buttonsPage = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder()
              .setCustomId("music-queue-page-previous")
              .setEmoji("⬅️")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("music-queue-page-current")
              .setLabel(`${page + 1}/${maxPage}`)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("music-queue-page-next")
              .setEmoji("➡️")
              .setStyle(ButtonStyle.Primary),
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
                      `* ${page * 10 + index + 1}. ${track.title} - ${
                        track.author
                      }`
                  )
                  .join("\n")
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
          if (currentPage === 0) return inter.deferUpdate();
          currentPage -= 1;
          reply.edit(createReply(currentPage));
          inter.deferUpdate();
        }

        if (inter.customId == "music-queue-page-current")
          return inter.deferUpdate();

        if (inter.customId === "music-queue-page-next") {
          if (currentPage === maxPage - 1) return inter.deferUpdate();
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
