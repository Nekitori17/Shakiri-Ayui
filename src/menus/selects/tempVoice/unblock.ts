import {
  ActionRowBuilder,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import sendError from "../../../helpers/sendError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";
import UserSettings from "../../../models/UserSettings";
import CommonEmbedBuilder from "../../../helpers/commonEmbedBuilder";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      if (!checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id)) {
        throw {
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        };
      }

      const userSettings = await UserSettings.findOne({
        userId: interaction.user.id,
      });

      const blockedUsers =
        userSettings?.temporaryVoiceChannel.blockedUsers ?? [];

      if (blockedUsers.length === 0) {
        throw {
          name: "NoUserBlocked",
          message: "You have not blocked any users. Nice",
        };
      }

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

      const createReply = (page: number) => {
        const bannedUserSelectMenu = blockedUsersPartition[page].map((userId) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(
              interaction.guild?.members.cache.get(userId)?.displayName ||
                userId
            )
            .setValue(userId)
        );

        const userSelectMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-unblock-select")
              .setPlaceholder("Select a user to unblock")
              .addOptions(bannedUserSelectMenu)
              .setMinValues(1)
              .setMaxValues(10)
              .setMaxValues(bannedUserSelectMenu.length)
          );

        const buttonsPage = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("temp-voice-unblock-previous")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("temp-voice-unblock-current")
            .setLabel(`${page + 1}/${maxPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("temp-voice-unblock-next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= maxPage - 1)
        );

        return {
          content:
            "> Select a user to unblock from your temporary voice channel",
          components: [userSelectMenu, buttonsPage],
        };
      };

      const sent = await interaction.editReply(createReply(currentPage));

      const collector = sent.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      collector.on("collect", async (collectInteraction) => {
        if (collectInteraction.isButton()) {
          if (collectInteraction.customId === "temp-voice-unblock-previous") {
            currentPage--;
            await interaction.editReply(createReply(currentPage));
            return collectInteraction.deferUpdate();
          }

          if (collectInteraction.customId === "temp-voice-unblock-next") {
            currentPage++;
            await collectInteraction.update(createReply(currentPage));
            return collectInteraction.deferUpdate();
          }

          if (collectInteraction.customId === "temp-voice-unblock-current")
            return collectInteraction.deferUpdate();
        }

        if (collectInteraction.isStringSelectMenu()) {
          await collectInteraction.deferReply({ ephemeral: true });
          try {
            const userIds = collectInteraction.values;
            const updatedBlockedUsers = blockedUsers.filter(
              (userId) => !userIds.includes(userId)
            );
            userSettings!.temporaryVoiceChannel.blockedUsers =
              updatedBlockedUsers;
            await userSettings!.save();

            const unblockedUsers = userIds.map(
              (userId) =>
                interaction.guild?.members.cache.get(userId)?.displayName ||
                userId
            );

            collectInteraction.editReply({
              embeds: [
                CommonEmbedBuilder.success({
                  title: "> Unblocked Users",
                  description: `Unblocked users: ${unblockedUsers.join(", ")}`,
                }),
              ],
            });
          } catch (error) {
            sendError(collectInteraction, error, true);
          }
        }
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  voiceChannel: true,
};

export default select;
