import _ from "lodash";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import UserSettings from "../../models/UserSettings";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Find the user's settings, or create new ones if they don't exist
      const userSetting = await UserSettings.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        {
          $setOnInsert: {
            userId: interaction.user.id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      const blockedUsers =
        userSetting?.temporaryVoiceChannel.blockedUsers ?? [];

      if (blockedUsers.length === 0)
        throw new CustomError({
          name: "NoUserBlocked",
          message: "You have not blocked any users. Nice",
          type: "info",
        });

      // Define the number of users to display per page
      const AMOUNT_USER_IN_PAGE = 25;
      const blockedUsersPartition: string[][] = [];

      // Calculate total users and maximum pages
      const totalUsers = blockedUsers.length;

      // Determine the chunk size for partitioning users into pages
      const maxPages = Math.floor(totalUsers / AMOUNT_USER_IN_PAGE) || 1;
      const chunkSize = Math.ceil(totalUsers / maxPages);

      blockedUsersPartition.push(..._.chunk(blockedUsers, chunkSize));

      let currentPage = 0;

      /**
       * Creates a reply object containing the select menu and pagination buttons for the unblock command.
       * @param page The current page number.
       * @returns An object with `content` and `components` properties.
       */
      const createReply = (page: number) => {
        // Map blocked users to StringSelectMenuOptionBuilder for the select menu
        const bannedUserSelectMenuOption = blockedUsersPartition[page].map(
          (userId) => {
            const user = client.users.cache.get(userId);
            return new StringSelectMenuOptionBuilder()
              .setLabel(user?.displayName ?? userId)
              .setDescription(user?.tag ?? userId)
              .setValue(userId);
          }
        );

        // Create the StringSelectMenuBuilder for selecting users to unblock
        const bannedUserSelectMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-unblock-select")
              .setPlaceholder("Select a user to unblock")
              .addOptions(bannedUserSelectMenuOption)
              .setMinValues(1)
              .setMaxValues(10)
              .setMaxValues(bannedUserSelectMenuOption.length)
          );

        // Create pagination buttons
        const buttonsPageRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("temp-voice-unblock-page-prev")
              .setEmoji("1387296301867073576")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("temp-voice-unblock-page-current")
              .setLabel(`${page + 1}/${maxPages}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("temp-voice-unblock-page-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPages - 1)
          );

        return {
          content:
            "> <:colorok:1387277169817817209> Select a user to unblock from your temporary voice channel",
          components: [bannedUserSelectMenu, buttonsPageRow],
        };
      };

      // Send the initial reply with the select menu and pagination buttons
      const bannedUserMenuReply = await interaction.editReply(
        createReply(currentPage)
      );

      // Create a message component collector to handle interactions with the select menu and buttons
      const bannedUserMenuCollector =
        bannedUserMenuReply.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      bannedUserMenuCollector.on(
        "collect",
        async (bannedUserMenuInteraction) => {
          // Handle button interactions for pagination
          if (bannedUserMenuInteraction.isButton()) {
            if (
              bannedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-prev"
            ) {
              currentPage--;
              await interaction.editReply(createReply(currentPage));
              return bannedUserMenuInteraction.deferUpdate();
            }

            // Handle next page button interaction
            if (
              bannedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-next"
            ) {
              currentPage++;
              await bannedUserMenuInteraction.update(createReply(currentPage));
              return bannedUserMenuInteraction.deferUpdate();
            }

            // Handle current page button interaction (do nothing)
            if (
              bannedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-current"
            )
              return bannedUserMenuInteraction.deferUpdate();
          }

          // Handle StringSelectMenu interactions for unblocking users
          if (bannedUserMenuInteraction.isStringSelectMenu()) {
            await bannedUserMenuInteraction.deferReply({
              flags: MessageFlags.Ephemeral,
            });

            try {
              // Get the selected users to unblock
              const userSelectedToUnblock = bannedUserMenuInteraction.values;
              // Filter out the selected users from the blocked users list
              const updatedBlockedUsers = blockedUsers.filter(
                (userId) => !userSelectedToUnblock.includes(userId)
              );

              // Update the user's settings with the new blocked users list
              userSetting!.temporaryVoiceChannel.blockedUsers =
                updatedBlockedUsers;

              await userSetting.save();
              // Send a success embed indicating the users have been unblocked
              bannedUserMenuInteraction.editReply({
                embeds: [
                  CommonEmbedBuilder.success({
                    title: "> <:colorok:1387277169817817209> Unblocked Users",
                    description: `Unblocked users: ${userSelectedToUnblock
                      .map((userId) => `<@${userId}>`)
                      .join(", ")}`,
                  }),
                ],
              });
            } catch (error) {
              sendError(bannedUserMenuInteraction, error, true);
            }
          }
        }
      );
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "voice-unblock",
  description: "Unblock a user from your temporary voice channel",
  deleted: false,
  devOnly: false,
  useInDm: false,
  requiredVoiceChannel: false,
};

export default command;
