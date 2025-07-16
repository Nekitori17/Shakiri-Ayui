import _ from "lodash";
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
import { CustomError } from "../../helpers/utils/CustomError";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { musicSourceIcons } from "../../constants/musicSourceIcons";
import { MusicPlayerSession } from "../../musicPlayerStoreSession";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const queryOption = interaction.options.getString("query", true);

      // Get guild settings for music playback
      const guildSetting = await config.modules(interaction.guildId!);

      // Get the main player instance
      const player = useMainPlayer();

      const searchResult = await player.search(queryOption, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      // If no tracks are found, throw an error
      if (!searchResult || searchResult.tracks.length === 0)
        throw new CustomError({
          name: "NoResults",
          message:
            "Please try again or try a different queryOption or platform",
        });

      // Define the number of tracks to display per page
      const AMOUNT_TRACK_IN_PAGE = 5;
      // Initialize an array to store tracks partitioned into pages
      const tracksPartition: Track[][] = [];

      const tracksArray = searchResult.tracks || [];
      const totalTracks = tracksArray.length;

      const maxPages = Math.floor(totalTracks / AMOUNT_TRACK_IN_PAGE) || 1;
      const chunkSize = Math.ceil(totalTracks / maxPages);

      tracksPartition.push(..._.chunk(tracksArray, chunkSize));

      let currentPage = 0;
      function createReply(page: number) {
        // Create navigation buttons for the search results pages
        const buttonsPageRow = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder()
              .setCustomId("search-searchResult-page-prev")
              .setEmoji("1387296301867073576")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("search-searchResult-page-current")
              .setLabel(`${page + 1}/${maxPages}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(false),
            new ButtonBuilder()
              .setCustomId("search-searchResult-page-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPages - 1),
          ],
        });

        // Create options for the select menu based on tracks in the current page
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
          }
        );

        // Create a select menu for choosing a track
        const trackSelectMenuRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("search-searchResult-select")
              .setPlaceholder("Select a track to play")
              .addOptions(trackSelectMenuOption)
          );

        return {
          // Create an embed for displaying search results
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
          components: [trackSelectMenuRow, buttonsPageRow],
          fetchReply: true,
        };
      }

      // Send the initial reply with the first page of search results
      const searchResultEmbedRely = await interaction.editReply(
        createReply(currentPage)
      );
      // Create a message component collector for button and select menu interactions
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
              // Find the selected track from the search results
              const track = searchResult.tracks.find((t) => t.id === trackId);

              if (!track)
                throw new CustomError({
                  name: "NoTrack",
                  message: "Track not found",
                });

              // Get the user's voice channel
              const userVoiceChannel = (
                searchResultSelectInteraction.member as GuildMember
              ).voice.channel;

              // If user is not in a voice channel, throw an error
              if (!userVoiceChannel)
                throw new CustomError({
                  name: "NoVoiceChannel",
                  message:
                    "You need to be in a voice channel to use this command",
                  type: "warning",
                });

              // Retrieve volume, repeat mode, and shuffle count from session store or queue
              const musicPlayerStoreSession = new MusicPlayerSession(
                interaction.guildId!
              );

              // Play the selected track in the user's voice channel
              await track.play(userVoiceChannel, {
                requestedBy: searchResultSelectInteraction.user,
                nodeOptions: {
                  metadata: {
                    channel: interaction.channel,
                  },
                  volume: await musicPlayerStoreSession.getVolume(),
                  leaveOnEmpty: guildSetting.music.leaveOnEmpty,
                  leaveOnEmptyCooldown: guildSetting.music.leaveOnEmptyCooldown,
                  leaveOnEnd: guildSetting.music.leaveOnEnd,
                  leaveOnEndCooldown: guildSetting.music.leaveOnEndCooldown,
                },
              });

              // Edit the reply to confirm the track has been added to the queue
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
            handleInteractionError(searchResultSelectInteraction, error);
          }
        }
      );

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  alias: "sr",
  name: "search",
  description: "Search for a song/URL and select to play from results",
  deleted: false,
  devOnly: false,
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
