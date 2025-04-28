import {
  ActionRowBuilder,
  ComponentType,
  GuildMember,
  MessageFlags,
  UserSelectMenuBuilder,
} from "discord.js";
import sendError from "../../../helpers/sendError";
import UserSettings from "../../../models/UserSettings";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";

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

      const row = new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
        new UserSelectMenuBuilder()
          .setCustomId("temp-voice-ban")
          .setPlaceholder("Select a user to ban")
          .setMinValues(1)
          .setMaxValues(10)
      );

      const sent = await interaction.editReply({
        content: "> Select a user to ban from your temporary voice channel",
        components: [row],
      });

      const collector = sent.createMessageComponentCollector({
        componentType: ComponentType.UserSelect,
        time: 60_000,
      });

      collector.on("collect", async (selectInteraction) => {
        await selectInteraction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const users = selectInteraction.users;
          const userSettings = await UserSettings.findOne({
            userId: interaction.user.id,
          });

          if (userSettings) {
            users.forEach((user) => {
              if (!userSettings.temporaryVoiceChannel.blockedUsers.includes(user.id))
                userSettings.temporaryVoiceChannel.blockedUsers.push(user.id);
            });
            await userSettings.save();
          } else {
            const newUserSettings = new UserSettings({
              userId: interaction.user.id,
              temporaryVoiceChannel: {
                channelName: null,
                blockedUsers: users.map((user) => user.id),
                limitUser: 0,
              },
            });
            await newUserSettings.save();
          }

          users.forEach(async (user) => {
            const member = await selectInteraction.guild?.members.fetch(user.id);
            if (member && member?.voice.channelId === userVoiceChannel?.id) {
              await member.voice.disconnect();
            }
          });

          selectInteraction.editReply({
            content: `> Banned users: ${users
              .map((user) => user.displayName)
              .join(", ")}`,
            components: [],
          });
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