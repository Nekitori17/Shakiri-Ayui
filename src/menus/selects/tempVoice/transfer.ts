import path from "path";
import jsonStore from "json-store-typed";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      const temporaryChannels = jsonStore(
        path.join(__dirname, "../../../../database/temporaryVoiceChannels.json")
      );

      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw {
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        };

      const transferableMembers = userVoiceChannel.members.filter(
        (member) => member.id !== interaction.user.id
      );

      if (!transferableMembers || transferableMembers.size === 0) {
        throw {
          name: "NoUserCanTransfer",
          message: "There are no users to transfer in this channel.",
        };
      }

      const AMOUNT_USER_IN_PAGE = 25;
      const transferableMemberArray = Array.from(transferableMembers.values());
      const transferableMembersPartition: GuildMember[][] = [];
      let currentPage = 0;
      const maxPage = Math.ceil(
        transferableMemberArray.length / AMOUNT_USER_IN_PAGE
      );

      for (let i = 0; i < maxPage; i++) {
        transferableMembersPartition.push(
          transferableMemberArray.slice(
            i * AMOUNT_USER_IN_PAGE,
            (i + 1) * AMOUNT_USER_IN_PAGE
          )
        );
      }

      const createReply = (page: number) => {
        const transferUserSelectMenu = transferableMembersPartition[page].map(
          (member) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(member.displayName)
              .setDescription(member.user.tag)
              .setValue(member.id)
        );

        const userSelectMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("temp-voice-transfer-select")
              .setPlaceholder("Select a user to transfer")
              .addOptions(transferUserSelectMenu)
              .setMaxValues(transferUserSelectMenu.length)
          );

        const buttonsPage = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("temp-voice-transfer-previous")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("temp-voice-transfer-current")
            .setLabel(`${page + 1}/${maxPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("temp-voice-transfer-next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= maxPage - 1)
        );

        return {
          content:
            "> Select a user to transfer your temporary voice channel to",
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
          if (collectInteraction.customId === "temp-voice-transfer-previous") {
            currentPage--;
            await interaction.editReply(createReply(currentPage));
            return collectInteraction.deferUpdate();
          }

          if (collectInteraction.customId === "temp-voice-transfer-next") {
            currentPage++;
            await collectInteraction.update(createReply(currentPage));
            return collectInteraction.deferUpdate();
          }

          if (collectInteraction.customId === "temp-voice-transfer-current")
            return collectInteraction.deferUpdate();
        }

        if (collectInteraction.isStringSelectMenu()) {
          await collectInteraction.deferReply({ ephemeral: true });
          try {
            const userId = collectInteraction.values[0];

            if ((await client.users.fetch(userId)).bot)
              throw {
                name: "CannotTransferToBot",
                message:
                  "Ahhhh. I don't think they can do something with this.",
                type: "warning",
              };

            temporaryChannels.set(userVoiceChannel.id, userId);
            collectInteraction.editReply({
              embeds: [
                CommonEmbedBuilder.success({
                  title: "> Transfered Temporary Channel",
                  description: `Transfered to user: <@${userId}>`,
                }),
              ],
            });
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
