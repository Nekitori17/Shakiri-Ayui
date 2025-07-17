import _ from "lodash";
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
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        // Check if the temporary voice channel belongs to the interacting user
        throw new CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        });

      const kickAbleMembers = userVoiceChannel.members.filter(
        // Filter out the current user and members with 'MoveMembers' or 'DeafenMembers' permissions
        (member) =>
          member.id !== interaction.user.id &&
          !member.permissions.has("MoveMembers") &&
          !member.permissions.has("DeafenMembers")
      );

      if (!kickAbleMembers || kickAbleMembers.size === 0)
        // If no kickable members are found, throw an error
        throw new CustomError({
          name: "NoUserCanKick",
          message: "There are no users to kick in this channel.",
          type: "info",
        });

      // Pagination setup for displaying kickable members
      const AMOUNT_USER_IN_PAGE = 25;
      const kickAbleMembersArray = Array.from(kickAbleMembers.values());
      const kickAbleMembersPartition: GuildMember[][] = [];
      let currentPage = 0;
      const maxPage =
        Math.ceil(kickAbleMembersArray.length / AMOUNT_USER_IN_PAGE) || 1;

      // Chunk members by the desired amount per page
      kickAbleMembersPartition.push(
        ..._.chunk(kickAbleMembersArray, AMOUNT_USER_IN_PAGE)
      );

      /**
       * Generates the content for a page displaying kickable users.
       * @param page The current page number.
       */
      const createUserSelectReply = (page: number) => {
        const kickUserSelectMenuOption = kickAbleMembersPartition[page].map(
          (member) =>
            // Create StringSelectMenuOptionBuilder for each kickable member
            new StringSelectMenuOptionBuilder()
              .setLabel(member.displayName)
              .setDescription(member.user.tag)
              .setValue(member.id)
        );

        const userSelectMenuRow =
          // Create the StringSelectMenu for selecting a user to kick
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-kick-select")
              .setPlaceholder("Select a user to kick")
              .addOptions(kickUserSelectMenuOption)
              .setMinValues(1)
              .setMaxValues(10)
              .setMaxValues(kickUserSelectMenuOption.length)
          );

        // Create pagination buttons
        const buttonsPageRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("temp-voice-kick-previous")
              .setEmoji("1387296301867073576")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("temp-voice-kick-current")
              .setLabel(`${page + 1}/${maxPage}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("temp-voice-kick-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPage - 1)
          );

        return {
          content: "> Select a user to kick from your temporary voice channel",
          components: [userSelectMenuRow, buttonsPageRow],
        };
      };

      // Send the initial reply with the first page of kickable users
      const userKickMenuReply = await interaction.editReply(
        createUserSelectReply(currentPage)
      );

      // Create a message component collector for interactions with the menu and buttons
      const userKickMenuCollector =
        userKickMenuReply.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      userKickMenuCollector.on("collect", async (userKickMenuInteraction) => {
        // Handle button interactions for pagination
        if (userKickMenuInteraction.isButton()) {
          if (userKickMenuInteraction.customId === "temp-voice-kick-previous") {
            currentPage--;
            await interaction.editReply(createUserSelectReply(currentPage));
            return userKickMenuInteraction.deferUpdate();
          }

          if (userKickMenuInteraction.customId === "temp-voice-kick-next") {
            currentPage++;
            await userKickMenuInteraction.update(
              createUserSelectReply(currentPage)
            );
            return userKickMenuInteraction.deferUpdate();
          }

          if (userKickMenuInteraction.customId === "temp-voice-kick-current")
            return userKickMenuInteraction.deferUpdate();
        }

        // Handle StringSelectMenu interaction for kicking users
        if (userKickMenuInteraction.isStringSelectMenu()) {
          await userKickMenuInteraction.deferReply({ ephemeral: true });

          try {
            const userIds = userKickMenuInteraction.values;
            const kickedUsers = [];

            // Iterate over selected user IDs and disconnect them from the voice channel
            for (const userId of userIds) {
              const member = await userKickMenuInteraction.guild?.members.fetch(
                userId
              );
              if (member) {
                await member.voice.disconnect();
                kickedUsers.push(member);
              }
            }

            // Edit the reply to confirm the kicked users
            await userKickMenuInteraction.editReply({
              content: null,
              embeds: [
                CommonEmbedBuilder.success({
                  title: "> Kicked Users",
                  description: `Kicked users: ${kickedUsers.join(", ")}`,
                }),
              ],
            });
          } catch (error) {
            handleInteractionError(userKickMenuInteraction, error);
          }
        }
      });

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
