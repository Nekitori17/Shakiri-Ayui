import {
  ActionRowBuilder,
  ComponentType,
  GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import sendError from "../../../helpers/sendError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";
import UserSettings from "../../../models/UserSettings";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel;

    try {
      if (!checkOwnTempVoice(userVoiceChannel?.id!, interaction.user.id))
        throw {
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        };

      const userSettings = await UserSettings.findOne({
        userId: interaction.user.id,
      });

      if (
        !userSettings ||
        userSettings.temporaryVoiceChannel.blockedUsers.length === 0
      )
        throw {
          name: "NoUserBanned",
          message: "You have not banned any users. Nice",
        };

      const bannedUserSelectMenu =
        userSettings.temporaryVoiceChannel.blockedUsers.map((userId) => {
          return new StringSelectMenuOptionBuilder()
            .setLabel(
              interaction.guild?.members.cache.get(userId)?.displayName ||
                userId
            )
            .setValue(userId);
        });

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("temp-voice-unban")
          .setPlaceholder("Select a user to unban")
          .addOptions(bannedUserSelectMenu)
          .setMinValues(1)
          .setMaxValues(99999999)
      );

      const sent = await interaction.editReply({
        content: "Select a user to unban from your temporary voice channel",
        components: [row],
      });

      const collector = sent.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on("collect", async (selectInteraction) => {
        await selectInteraction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const userIds = selectInteraction.values;
          const unbannedUsers = [];
          const updatedBlockedUsers = (
            await userSettings
          ).temporaryVoiceChannel.blockedUsers.filter(
            (userId) => !userIds.includes(userId)
          );
          userSettings.temporaryVoiceChannel.blockedUsers = updatedBlockedUsers;
          await userSettings.save();
          for (const userId of userIds) {
            const member = selectInteraction.guild?.members.cache.get(userId);
            if (member) {
              unbannedUsers.push(member.displayName);
            } else {
              unbannedUsers.push(userId);
            }
          }
          selectInteraction.editReply(
            `> Unbanned users: ${unbannedUsers.join(", ")}`
          );
          collector.stop();
        } catch (error) {
          sendError(selectInteraction, error, true);
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
