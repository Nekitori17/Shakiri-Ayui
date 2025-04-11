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

      const kickUserSelectMenu = userVoiceChannel?.members.map((member) => {
        if (
          member.id !== interaction.user.id &&
          !member.permissions.has("MoveMembers") &&
          !member.permissions.has("DeafenMembers")
        ) {
          return new StringSelectMenuOptionBuilder()
            .setLabel(member.displayName)
            .setValue(member.id);
        }
      });

      if (!kickUserSelectMenu)
        throw {
          name: "NoUserCanKick",
          message: "There are no users to kick in this channel.",
        };

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("temp-voice-kick")
          .setPlaceholder("Select a user to kick")
          .addOptions(kickUserSelectMenu.filter((option) => option !== undefined))
          .setMinValues(1)
          .setMaxValues(99999999)
      );

      const sent = await interaction.editReply({
        content: "Select a user to kick from your temporary voice channel",
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
          const kickedUsers = [];
          for (const userId of userIds) {
            const member = await selectInteraction.guild?.members.fetch(userId);
            if (member) {
              await member.voice.disconnect();
              kickedUsers.push(member.displayName);
            }
          }
          selectInteraction.editReply(
            `> Kicked users: ${kickedUsers.join(", ")}`
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
