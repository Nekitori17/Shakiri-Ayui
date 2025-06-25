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
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const userSettings = await UserSettings.findOneAndUpdate(
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
        userSettings?.temporaryVoiceChannel.blockedUsers ?? [];

      if (blockedUsers.length === 0) {
        throw {
          name: "NoUserBlocked",
          message: "You have not blocked any users. Nice",
          type: "info",
        };
      }

      const AMOUNT_USER_IN_PAGE = 25;
      const blockedUsersPartition: string[][] = [];

      const totalUsers = blockedUsers.length;

      const maxPages = Math.floor(totalUsers / AMOUNT_USER_IN_PAGE) || 1;
      const chunkSize = Math.ceil(totalUsers / maxPages);

      blockedUsersPartition.push(..._.chunk(blockedUsers, chunkSize));

      let currentPage = 0;
      const createReply = (page: number) => {
        const bannedUserSelectMenu = blockedUsersPartition[page].map(
          (userId) => {
            const user = client.users.cache.get(userId);
            return new StringSelectMenuOptionBuilder()
              .setLabel(user?.displayName ?? userId)
              .setDescription(user?.tag ?? userId)
              .setValue(userId);
          }
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
            .setEmoji("1387296301867073576")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("temp-voice-unblock-current")
            .setLabel(`${page + 1}/${maxPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("temp-voice-unblock-next")
            .setEmoji("1387296195256254564")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= maxPages - 1)
        );

        return {
          content:
            "> <:colorok:1387277169817817209> Select a user to unblock from your temporary voice channel",
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

            collectInteraction.editReply({
              embeds: [
                CommonEmbedBuilder.success({
                  title: "> <:colorok:1387277169817817209> Unblocked Users",
                  description: `Unblocked users: ${userIds
                    .map((userId) => `<@${userId}>`)
                    .join(", ")}`,
                }),
              ],
            });
          } catch (error) {
            sendError(collectInteraction, error, true);
          }
        }
      });
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "voice-unblock",
  description: "Unblock a user from your temporary voice channel",
  deleted: false,
};

export default command;
