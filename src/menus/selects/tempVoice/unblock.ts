import _ from "lodash";
import {
  ActionRowBuilder,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import checkOwnTempVoice from "../../../helpers/discord/validators/checkOwnTempVoice";
import UserSettings from "../../../models/UserSettings";
import { createPageNavigationMenu } from "../../../components/pageNavigationMenu";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw new client.CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        });

      // Find and update user settings, creating if it doesn't exist
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
          returnDocument: "after",
        },
      );

      // This retrieves the user's blocked users list
      const blockedUsers =
        userSetting?.temporaryVoiceChannel.blockedUsers ?? [];

      // If no users are blocked, throw an info error
      if (blockedUsers.length === 0) {
        throw new client.CustomError({
          name: "NoUserBlocked",
          message: "You have not blocked any users. Nice",
          type: "info",
        });
      }

      // Pagination setup for displaying blocked users
      const AMOUNT_USER_IN_PAGE = 25;
      const blockedUsersPartition: string[][] = [];
      let currentPage = 0;
      const maxPage = Math.ceil(blockedUsers.length / AMOUNT_USER_IN_PAGE) || 1;

      // Chunk users by the desired amount per page
      blockedUsersPartition.push(..._.chunk(blockedUsers, AMOUNT_USER_IN_PAGE));

      /**
       * Generates the content for a page displaying blocked users.
       * @param page The current page number.
       * @returns An object containing the content and components for the reply.
       */
      function generateBlockedUsersPage(page: number) {
        const blockedUserSelectMenuOption = blockedUsersPartition[page].map(
          (userId) => {
            const user = client.users.cache.get(userId);
            return new StringSelectMenuOptionBuilder()
              .setLabel(user?.displayName ?? userId)
              .setDescription(user?.tag ?? userId)
              .setValue(userId);
          },
        );

        // Create the StringSelectMenu for unblocking users
        const blockedUserSelectMenuRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-unblock-select")
              .setPlaceholder("Select a user to unblock")
              .addOptions(blockedUserSelectMenuOption)
              .setMinValues(1)
              .setMaxValues(10)
              .setMaxValues(blockedUserSelectMenuOption.length),
          );

        // Create pagination buttons
        const buttonsPageRow = createPageNavigationMenu(
          page,
          maxPage,
          "temp-voice-unblock",
        );

        return {
          content:
            "> Select a user to unblock from your temporary voice channel",
          components: [blockedUserSelectMenuRow, buttonsPageRow],
        };
      }

      // Send the initial reply with the first page of blocked users
      const blockedUsersMenuReply = await interaction.editReply(
        generateBlockedUsersPage(currentPage),
      );

      // Create a message component collector for interactions with the menu and buttons
      const blockedUserMenuCollector =
        blockedUsersMenuReply.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      // Handle collected interactions
      blockedUserMenuCollector.on(
        "collect",
        async (blockedUserMenuInteraction) => {
          if (blockedUserMenuInteraction.isButton()) {
            if (
              blockedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-prev"
            ) {
              currentPage--;
              await interaction.editReply(
                generateBlockedUsersPage(currentPage),
              );
              return blockedUserMenuInteraction.deferUpdate();
            }

            if (
              blockedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-next"
            ) {
              currentPage++;
              await blockedUserMenuInteraction.update(
                generateBlockedUsersPage(currentPage),
              );
              return blockedUserMenuInteraction.deferUpdate();
            }

            if (
              blockedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-current"
            )
              return blockedUserMenuInteraction.deferUpdate();
          }

          if (blockedUserMenuInteraction.isStringSelectMenu()) {
            const userIds = blockedUserMenuInteraction.values;

            try {
              await blockedUserMenuInteraction.deferReply({ ephemeral: true });

              const updatedBlockedUsers = blockedUsers.filter(
                // Filter out the selected user IDs from the blocked list
                (userId) => !userIds.includes(userId),
              );

              // Update the user's blocked users list in the database
              userSetting.temporaryVoiceChannel.blockedUsers =
                updatedBlockedUsers;
              await userSetting.save();

              // Edit the reply to confirm the unblocked users
              blockedUserMenuInteraction.editReply({
                embeds: [
                  client.CommonEmbedBuilder.success({
                    title: "> Unblocked Users",
                    description: `Unblocked users: ${userIds
                      .map((userId) => `<@${userId}>`)
                      .join(", ")}`,
                  }),
                ],
              });
            } catch (error) {
              client.interactionErrorHandler(
                blockedUserMenuInteraction,
                error,
                true,
              );
            }
          }
        },
      );

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

export default select;
