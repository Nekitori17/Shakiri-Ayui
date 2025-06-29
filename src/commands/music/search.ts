import config from "../../config";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { QueryType, Track, TrackSource, useMainPlayer } from "discord-player";
import sendError from "../../helpers/utils/sendError";
import { musicPlayerStoreSession } from "../../musicPlayerStoreSession";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { CommandInterface } from "../../types/InteractionInterfaces";
import _ from "lodash";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const query = interaction.options.get("query")?.value as string;

    try {
      const settings = await config.modules(interaction.guildId!);
      const player = useMainPlayer();

      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!result || result.tracks.length === 0)
        throw {
          name: "NoResults",
          message: "Please try again or try a different query or platform",
        };

      const AMOUNT_TRACK_IN_PAGE = 5;
      const tracksPartition: Track[][] = [];

      const tracksArray = result.tracks || [];
      const totalTracks = tracksArray.length;

      const maxPages = Math.floor(totalTracks / AMOUNT_TRACK_IN_PAGE) || 1;
      const chunkSize = Math.ceil(totalTracks / maxPages);

      tracksPartition.push(..._.chunk(tracksArray, chunkSize));

      let currentPage = 0;
      function createReply(page: number) {
        const buttonsPage = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder()
              .setCustomId("search-result-page-previous")
              .setEmoji("1387296301867073576")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("search-result-page-current")
              .setLabel(`${page + 1}/${maxPages}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(false),
            new ButtonBuilder()
              .setCustomId("search-result-page-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPages - 1),
          ],
        });

        const trackSelectMenuToPlay = tracksPartition[page].map(
          (track, index) => {
            const label = `${page * 10 + index + 1}. ${track.title}`;
            const truncatedLabel =
              label.length > 100 ? label.substring(0, 97) + "..." : label;
            const truncatedAuthor =
              track.author.length > 100
                ? track.author.substring(0, 97) + "..."
                : track.author;

            return new StringSelectMenuOptionBuilder()
              .setLabel(truncatedLabel)
              .setValue(track.id)
              .setDescription(truncatedAuthor);
          }
        );

        const trackSelectMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("search-result-select")
              .setPlaceholder("Select a track to play")
              .addOptions(trackSelectMenuToPlay)
          );

        return {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Results for: ${
                  query.length > 50 ? query.substring(0, 47) + "..." : query
                }`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTitle(
                `> <:colormusic:1387285617599184977> Search Results (Page ${
                  page + 1
                }/${maxPages})`
              )
              .setDescription(
                tracksPartition[page]
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
                text: `Requested by ${interaction.user.username} | ${tracksArray.length} tracks found`,
                iconURL: interaction.guild?.iconURL() ?? undefined,
              })
              .setTimestamp()
              .setColor("#00ffc8"),
          ],
          components: [trackSelectMenu, buttonsPage],
          fetchReply: true,
        };
      }

      const message = await interaction.editReply(createReply(currentPage));
      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 120_000,
        idle: 60_000,
      });

      collector.on("collect", async (collectInteraction) => {
        if (
          !collectInteraction.isButton() &&
          !collectInteraction.isStringSelectMenu()
        )
          return;

        try {
          if (collectInteraction.isButton()) {
            if (collectInteraction.customId === "search-result-page-previous") {
              currentPage--;
              await interaction.editReply(createReply(currentPage));
              return collectInteraction.deferUpdate();
            }

            if (collectInteraction.customId === "search-result-page-current") {
              return collectInteraction.deferUpdate();
            }

            if (collectInteraction.customId === "search-result-page-next") {
              currentPage++;
              await interaction.editReply(createReply(currentPage));
              return collectInteraction.deferUpdate();
            }
          }

          if (collectInteraction.isStringSelectMenu()) {
            await collectInteraction.deferReply();
            const trackId = collectInteraction.values[0];
            const track = result.tracks.find((t) => t.id === trackId);

            if (!track)
              throw {
                name: "NoTrack",
                message: "Track not found",
              };

            const userVoiceChannel = (collectInteraction.member as GuildMember)
              .voice.channel;

            if (!userVoiceChannel)
              throw {
                name: "NoVoiceChannel",
                message:
                  "You need to be in a voice channel to use this command",
              };

            await track.play(userVoiceChannel, {
              requestedBy: collectInteraction.user,
              nodeOptions: {
                metadata: {
                  channel: interaction.channel,
                },
                volume:
                  (musicPlayerStoreSession.volume.get(
                    interaction.guildId!
                  ) as number) ?? settings.music.volume,
                leaveOnEmpty: settings.music.leaveOnEmpty,
                leaveOnEmptyCooldown: settings.music.leaveOnEmptyCooldown,
                leaveOnEnd: settings.music.leaveOnEnd,
                leaveOnEndCooldown: settings.music.leaveOnEndCooldown,
              },
            });

            collectInteraction.editReply({
              content: null,
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `🎶 | Added ${track.title} by ${track.author} to the queue!`,
                    iconURL: track.thumbnail,
                    url: track.url,
                  })
                  .setFooter({
                    text: `Request by: ${track.requestedBy?.displayName}`,
                    iconURL: musicSourceIcons[track.source as TrackSource],
                  })
                  .setColor("Green"),
              ],
            });
          }
        } catch (error) {
          sendError(collectInteraction, error, true);
        }
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  name: "search",
  description: "Search for a song/URL and select from results",
  deleted: false,
  options: [
    {
      name: "query",
      description: "Song name or URL to search for",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  voiceChannel: true,
  permissionsRequired: [PermissionFlagsBits.Connect],
  botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
};

export default command;
