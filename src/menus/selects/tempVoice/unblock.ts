import {
  ActionRowBuilder,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import UserSettings from "../../../models/UserSettings";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw new CustomError({
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
          new: true,
        }
      );

      // This retrieves the user's blocked users list
      const blockedUsers =
        userSetting?.temporaryVoiceChannel.blockedUsers ?? [];

      // If no users are blocked, throw an info error
      if (blockedUsers.length === 0) {
        throw new CustomError({
          name: "NoUserBlocked",
          message: "You have not blocked any users. Nice",
          type: "info",
        });
      }

      // Pagination setup for displaying blocked users
      const AMOUNT_USER_IN_PAGE = 25;
      const blockedUsersPartition: string[][] = [];
      let currentPage = 0;
      const maxPage = Math.ceil(blockedUsers.length / AMOUNT_USER_IN_PAGE);

      for (let i = 0; i < maxPage; i++) {
        blockedUsersPartition.push(
          blockedUsers.slice(
            i * AMOUNT_USER_IN_PAGE,
            (i + 1) * AMOUNT_USER_IN_PAGE
          )
        );
      }

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
          }
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
              .setMaxValues(blockedUserSelectMenuOption.length)
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
              .setCustomId("temp-voice-unblock-pag-current")
              .setLabel(`${page + 1}/${maxPage}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("temp-voice-unblock-page-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPage - 1)
          );

        return {
          content:
            "> Select a user to unblock from your temporary voice channel",
          components: [blockedUserSelectMenuRow, buttonsPageRow],
        };
      }

      // Send the initial reply with the first page of blocked users
      const blockedUsersMenuReply = await interaction.editReply(
        generateBlockedUsersPage(currentPage)
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
                generateBlockedUsersPage(currentPage)
              );
              return blockedUserMenuInteraction.deferUpdate();
            }

            if (
              blockedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-next"
            ) {
              currentPage++;
              await blockedUserMenuInteraction.update(
                generateBlockedUsersPage(currentPage)
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
                (userId) => !userIds.includes(userId)
              );

              // Update the user's blocked users list in the database
              userSetting.temporaryVoiceChannel.blockedUsers =
                updatedBlockedUsers;
              await userSetting.save();

              // Edit the reply to confirm the unblocked users
              blockedUserMenuInteraction.editReply({
                embeds: [
                  CommonEmbedBuilder.success({
                    title: "> Unblocked Users",
                    description: `Unblocked users: ${userIds
                      .map((userId) => `<@${userId}>`)
                      .join(", ")}`,
                  }),
                ],
              });
            } catch (error) {
              handleInteractionError(blockedUserMenuInteraction, error);
            }
          }
        }
      );

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
