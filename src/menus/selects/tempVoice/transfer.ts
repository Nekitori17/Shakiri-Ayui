import _ from "lodash";
import path from "path";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import jsonStore from "json-store-typed";
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

      // Initialize jsonStore for temporary voice channels
      const temporaryChannels = jsonStore(
        path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
      );

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw new CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        });

      // Filter out the current user and bots to find transferable members
      const transferableMembers = userVoiceChannel.members.filter(
        (member) => member.id !== interaction.user.id && !member.user.bot
      );

      // If no transferable members are found, throw an error
      if (!transferableMembers || transferableMembers.size === 0)
        throw new CustomError({
          name: "NoUserCanTransfer",
          message: "There are no users to transfer in this channel.",
          type: "info",
        });

      // Pagination setup for displaying transferable members
      const AMOUNT_USER_IN_PAGE = 25;
      const transferableMemberArray = Array.from(transferableMembers.values());
      const transferableMembersPartition: GuildMember[][] = [];
      let currentPage = 0;
      const maxPage =
        Math.ceil(transferableMemberArray.length / AMOUNT_USER_IN_PAGE) || 1;

      // Chunk members by the desired amount per page
      transferableMembersPartition.push(
        ..._.chunk(transferableMemberArray, AMOUNT_USER_IN_PAGE)
      );

      /**
       * Generates the content for a page displaying transferable users.
       * @param page The current page number.
       */
      const createReply = (page: number) => {
        const transferUserSelectMenu = transferableMembersPartition[page].map(
          (member) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(member.displayName)
              .setDescription(member.user.tag)
              .setValue(member.id)
        );

        // Create the StringSelectMenu for selecting a user to transfer to
        const userSelectMenuRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-transfer-select")
              .setPlaceholder("Select a user to transfer")
              .addOptions(transferUserSelectMenu)
              .setMaxValues(transferUserSelectMenu.length)
          );

        // Create pagination buttons
        const buttonsPageRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("temp-voice-transfer-page-prev")
              .setEmoji("1387296301867073576")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("temp-voice-transfer-page-current")
              .setLabel(`${page + 1}/${maxPage}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("temp-voice-transfer=page-next")
              .setEmoji("1387296195256254564")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= maxPage - 1)
          );

        return {
          content:
            "> Select a user to transfer your temporary voice channel to",
          components: [userSelectMenuRow, buttonsPageRow],
        };
      };

      // Send the initial reply with the first page of transferable users
      const transferUserMenuReply = await interaction.editReply(
        createReply(currentPage)
      );

      // Create a message component collector for interactions with the menu and buttons
      const transferUserMenuCollector =
        transferUserMenuReply.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60_000,
        });

      // Handle collected interactions
      transferUserMenuCollector.on(
        "collect",
        async (transferUserMenuInteraction) => {
          if (transferUserMenuInteraction.isButton()) {
            //
            if (
              transferUserMenuInteraction.customId ===
              "temp-voice-transfer-page-prev"
            ) {
              currentPage--;
              await interaction.editReply(createReply(currentPage));
              return transferUserMenuInteraction.deferUpdate();
            }

            if (
              transferUserMenuInteraction.customId ===
              "temp-voice-transfer-page-next"
            ) {
              currentPage++;
              await transferUserMenuInteraction.update(
                createReply(currentPage)
              );
              return transferUserMenuInteraction.deferUpdate();
            }

            if (
              transferUserMenuInteraction.customId ===
              "temp-voice-transfer-page-current"
            )
              return transferUserMenuInteraction.deferUpdate();
          }

          if (transferUserMenuInteraction.isStringSelectMenu()) {
            await transferUserMenuInteraction.deferReply({ ephemeral: true });

            try {
              const userId = transferUserMenuInteraction.values[0];

              // Update the temporary channel owner in the database
              temporaryChannels.set(userVoiceChannel.id, userId);

              // Edit the reply to confirm the transfer
              transferUserMenuInteraction.editReply({
                embeds: [
                  CommonEmbedBuilder.success({
                    title: "> Transferred Temporary Channel",
                    description: `Transferred to user: <@${userId}>`,
                  }),
                ],
              });
            } catch (error) {
              handleInteractionError(transferUserMenuInteraction, error, true);
            }
          }
        }
      );

      return true;
    } catch (error) {
      handleInteractionError(interaction, error, true);

      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
