import _ from "lodash";
import {
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import UserSettings from "../../models/UserSettings";
import { createPageNavigationMenu } from "../../components/pageNavigationMenu";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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

      const blockedUsers =
        userSetting?.temporaryVoiceChannel.blockedUsers ?? [];

      if (blockedUsers.length === 0)
        throw new client.CustomError({
          name: "NoUserBlocked",
          message: "You have not blocked any users. Nice",
          type: "info",
        });

      const AMOUNT_USER_PER_PAGE = 25;
      const blockedUsersPartition: string[][] = [];

      // Calculate total users and maximum pages
      const totalUsers = blockedUsers.length;
      const maxPages = Math.ceil(totalUsers / AMOUNT_USER_PER_PAGE) || 1;

      // Chunk users by the desired amount per page
      blockedUsersPartition.push(
        ..._.chunk(blockedUsers, AMOUNT_USER_PER_PAGE),
      );

      let currentPage = 0;

      const createReply = (page: number) => {
        // Map blocked users to StringSelectMenuOptionBuilder for the select menu
        const bannedUserSelectMenuOption = blockedUsersPartition[page].map(
          (userId) => {
            const user = client.users.cache.get(userId);
            return new StringSelectMenuOptionBuilder()
              .setLabel(user?.displayName ?? userId)
              .setDescription(user?.tag ?? userId)
              .setValue(userId);
          },
        );

        const bannedUserSelectMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-unblock-select")
              .setPlaceholder("Select a user to unblock")
              .addOptions(bannedUserSelectMenuOption)
              .setMinValues(1)
              .setMaxValues(10)
              .setMaxValues(bannedUserSelectMenuOption.length),
          );

        const buttonsPageRow = createPageNavigationMenu(
          page,
          maxPages,
          "temp-voice-unblock",
        );

        return {
          content:
            "> <:colorok:1387277169817817209> Select a user to unblock from your temporary voice channel",
          components: [bannedUserSelectMenu, buttonsPageRow],
        };
      };

      const bannedUserMenuReply = await interaction.editReply(
        createReply(currentPage),
      );

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

            if (
              bannedUserMenuInteraction.customId ===
              "temp-voice-unblock-page-next"
            ) {
              currentPage++;
              await bannedUserMenuInteraction.update(createReply(currentPage));
              return bannedUserMenuInteraction.deferUpdate();
            }

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
              const userSelectedToUnblock = bannedUserMenuInteraction.values;
              const updatedBlockedUsers = blockedUsers.filter(
                (userId) => !userSelectedToUnblock.includes(userId),
              );

              userSetting!.temporaryVoiceChannel.blockedUsers =
                updatedBlockedUsers;

              await userSetting.save();
              bannedUserMenuInteraction.editReply({
                embeds: [
                  client.CommonEmbedBuilder.success({
                    title: "> <:colorok:1387277169817817209> Unblocked Users",
                    description: `Unblocked users: ${userSelectedToUnblock
                      .map((userId) => `<@${userId}>`)
                      .join(", ")}`,
                  }),
                ],
              });
            } catch (error) {
              client.interactionErrorHandler(bannedUserMenuInteraction, error);
            }
          }
        },
      );

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "voice-unblock",
  description: "Unblock a user from your temporary voice channel",
  disabled: false,
  deleted: false,
  devOnly: false,
  useInDm: true,
  requiredVoiceChannel: false,
};

export default command;
