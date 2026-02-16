import _ from "lodash";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { QueryType, Track, TrackSource, useMainPlayer } from "discord-player";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { VoiceStoreSession } from "../../classes/VoiceStoreSession";
import { createPageNavigationMenu } from "../../components/pageNavigationMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const queryOption = interaction.options.getString("query", true);

      const guildSetting = await client.getGuildSetting(interaction.guildId!);

      const player = useMainPlayer();

      const searchResult = await player.search(queryOption, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!searchResult || searchResult.tracks.length === 0)
        throw new client.CustomError({
          name: "NoResults",
          message:
            "Please try again or try a different queryOption or platform",
        });

      const AMOUNT_TRACK_PER_PAGE = 5;
      const tracksPartition: Track[][] = [];

      const tracksArray = searchResult.tracks || [];
      const totalTracks = tracksArray.length;

      // Calculate total number of pages
      const maxPages = Math.ceil(totalTracks / AMOUNT_TRACK_PER_PAGE) || 1;

      // Chunk tracks by the desired amount per page
      tracksPartition.push(..._.chunk(tracksArray, AMOUNT_TRACK_PER_PAGE));

      let currentPage = 0;
      function createReply(page: number) {
        const buttonsPageRow = createPageNavigationMenu(
          page,
          maxPages,
          "search-searchResult",
        );

        const trackSelectMenuOption = tracksPartition[page].map(
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
          },
        );

        const trackSelectMenuRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("search-searchResult-select")
              .setPlaceholder("Select a track to play")
              .addOptions(trackSelectMenuOption),
          );

        return {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Results for: ${
                  queryOption.length > 50
                    ? queryOption.substring(0, 47) + "..."
                    : queryOption
                }`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTitle(
                `> <:colormusic:1387285617599184977> Search Results (Page ${
                  page + 1
                }/${maxPages})`,
              )
              .setDescription(
                tracksPartition[page]
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
                text: `Requested by ${interaction.user.username} | ${tracksArray.length} tracks found`,
                iconURL: interaction.guild?.iconURL() ?? undefined,
              })
              .setTimestamp()
              .setColor("#00ffc8"),
          ],
          components: [trackSelectMenuRow, buttonsPageRow],
          fetchReply: true,
        };
      }

      const searchResultEmbedRely = await interaction.editReply(
        createReply(currentPage),
      );
      const searchResultEmbedCollector =
        searchResultEmbedRely.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 120_000,
          idle: 60_000,
        });

      searchResultEmbedCollector.on(
        "collect",
        async (searchResultSelectInteraction) => {
          if (
            !searchResultSelectInteraction.isButton() &&
            !searchResultSelectInteraction.isStringSelectMenu()
          )
            return;

          try {
            // Handle button interactions for page navigation
            if (searchResultSelectInteraction.isButton()) {
              if (
                searchResultSelectInteraction.customId ===
                "search-searchResult-page-prev"
              ) {
                currentPage--;
                await interaction.editReply(createReply(currentPage));
                return searchResultSelectInteraction.deferUpdate();
              }

              if (
                searchResultSelectInteraction.customId ===
                "search-searchResult-page-current"
              ) {
                return searchResultSelectInteraction.deferUpdate();
              }

              if (
                searchResultSelectInteraction.customId ===
                "search-searchResult-page-next"
              ) {
                currentPage++;
                await interaction.editReply(createReply(currentPage));
                return searchResultSelectInteraction.deferUpdate();
              }
            }

            // Handle select menu interaction for playing a selected track
            if (searchResultSelectInteraction.isStringSelectMenu()) {
              await searchResultSelectInteraction.deferReply();
              const trackId = searchResultSelectInteraction.values[0];
              const track = searchResult.tracks.find((t) => t.id === trackId);

              if (!track)
                throw new client.CustomError({
                  name: "NoTrack",
                  message: "Track not found",
                });

              const userVoiceChannel = (
                searchResultSelectInteraction.member as GuildMember
              ).voice.channel;

              if (!userVoiceChannel)
                throw new client.CustomError({
                  name: "NoVoiceChannel",
                  message:
                    "You need to be in a voice channel to use this command",
                  type: "warning",
                });

              const voiceStoreSession = new VoiceStoreSession(
                interaction.guildId!,
              );

              await track.play(userVoiceChannel, {
                requestedBy: searchResultSelectInteraction.user,
                nodeOptions: {
                  metadata: {
                    channel: interaction.channel,
                  },
                  volume: await voiceStoreSession.getVolume(),
                  leaveOnEmpty: guildSetting.music.leaveOnEmpty,
                  leaveOnEmptyCooldown: guildSetting.music.leaveOnEmptyCooldown,
                  leaveOnEnd: guildSetting.music.leaveOnEnd,
                  leaveOnEndCooldown: guildSetting.music.leaveOnEndCooldown,
                },
              });

              searchResultSelectInteraction.editReply({
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
            client.interactionErrorHandler(
              searchResultSelectInteraction,
              error,
            );
          }
        },
      );

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  alias: ["sr"],
  name: "search",
  description: "Search for a song/URL and select to play from results",
  deleted: false,
  devOnly: false,
  disabled: false,
  options: [
    {
      name: "query",
      description: "Song name or URL to search for",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.Connect],
  botPermissionsRequired: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ],
};

export default command;
