import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { Track, useQueue } from "discord-player";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const queue = useQueue(interaction.guild?.id!);

    try {
      if (queue?.tracks.size == 0)
        throw {
          name: "No Queue",
          message: "There is no queue to show",
        };

      const queuePartition: Track[][] = [];
      let currentPage = 0;
      const tracksArray = queue?.tracks.toArray() || [];
      const maxPage = Math.floor(tracksArray.length / 10) + 1;
      for (let i = 0; i < maxPage; i++) {
        queuePartition.push(tracksArray.slice(i * 10, (i + 1) * 10));
      }

      function createEmbedForPage(page: number): EmbedBuilder {
        return new EmbedBuilder()
          .setAuthor({
            name: interaction.user.displayName,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("> 🎶 Queue")
          .setDescription(
            queuePartition[page]
              .map(
                (track, index) =>
                  `* ${page * 10 + index + 1}. ${track.title} - ${track.author}`
              )
              .join("\n")
          )
          .setFooter({
            text: interaction.guild?.name!,
          })
          .setTimestamp()
          .setColor("#00ffc8");
      }

      const buttonsPage = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder()
            .setCustomId("musicQueuePagePrevious")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("musicQueuePageNext")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary),
        ],
      });

      const reply = await interaction.editReply({
        embeds: [createEmbedForPage(currentPage)],
        components: [buttonsPage],
      });

      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: filter,
        time: 60_000,
      });

      collector.on("collect", async (inter) => {
        if (inter.customId === "musicQueuePagePrevious") {
          if (currentPage === 0) return inter.deferUpdate();;
          currentPage -= 1;
          reply.edit({
            embeds: [createEmbedForPage(currentPage)],
          });
          inter.deferUpdate();
        }

        if (inter.customId === "musicQueuePageNext") {
          if (currentPage === maxPage - 1) return inter.deferUpdate();;
          currentPage += 1;
          reply.edit({
            embeds: [createEmbedForPage(currentPage)],
          });
          inter.deferUpdate();
        }
      });
    } catch (error: { name: string; message: string } | any) {
      await interaction.deleteReply();
      console.log(error);
      (interaction.channel as TextChannel)?.send({
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
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
