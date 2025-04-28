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

      const kickableMembers = userVoiceChannel?.members.filter(
        (member) =>
          member.id !== interaction.user.id &&
          !member.permissions.has("MoveMembers") &&
          !member.permissions.has("DeafenMembers")
      );

      if (!kickableMembers || kickableMembers.size === 0) {
        throw {
          name: "NoUserCanKick",
          message: "There are no users to kick in this channel.",
        };
      }

      const AMOUNT_USER_IN_PAGE = 25;
      const kickableMembersArray = Array.from(kickableMembers.values());
      const kickableMembersPartition: GuildMember[][] = [];
      let currentPage = 0;
      const maxPage = Math.ceil(kickableMembersArray.length / AMOUNT_USER_IN_PAGE);

      for (let i = 0; i < maxPage; i++) {
        kickableMembersPartition.push(
          kickableMembersArray.slice(
            i * AMOUNT_USER_IN_PAGE,
            (i + 1) * AMOUNT_USER_IN_PAGE
          )
        );
      }

      const createReply = (page: number) => {
        const kickUserSelectMenu = kickableMembersPartition[page].map((member) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(member.displayName)
            .setValue(member.id)
        );

        const userSelectMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-kick-select")
              .setPlaceholder("Select a user to kick")
              .addOptions(kickUserSelectMenu)
              .setMinValues(1)
              .setMaxValues(10)
              .setMaxValues(kickUserSelectMenu.length)
          );

        const buttonsPage = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("temp-voice-kick-previous")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("temp-voice-kick-current")
            .setLabel(`${page + 1}/${maxPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("temp-voice-kick-next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= maxPage - 1)
        );

        return {
          content: "> Select a user to kick from your temporary voice channel",
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
          if (collectInteraction.customId === "temp-voice-kick-previous") {
            currentPage--;
            await interaction.editReply(createReply(currentPage));
            return collectInteraction.deferUpdate();
          }

          if (collectInteraction.customId === "temp-voice-kick-next") {
            currentPage++;
            await collectInteraction.update(createReply(currentPage));
            return collectInteraction.deferUpdate();
          }

          if (collectInteraction.customId === "temp-voice-kick-current")
            return collectInteraction.deferUpdate();
        }

        if (collectInteraction.isStringSelectMenu()) {
          await collectInteraction.deferReply({ ephemeral: true });
          try {
            const userIds = collectInteraction.values;
            const kickedUsers = [];
            
            for (const userId of userIds) {
              const member = await collectInteraction.guild?.members.fetch(userId);
              if (member) {
                await member.voice.disconnect();
                kickedUsers.push(member.displayName);
              }
            }
            
            await collectInteraction.editReply(
              `> Kicked users: ${kickedUsers.join(", ")}`
            );
            collector.stop();
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