import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  GuildMember,
  MessageFlags,
  User,
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
          .setCustomId("temp-voice-invite")
          .setPlaceholder("Select a user to invite")
          .setMinValues(1)
          .setMaxValues(10)
      );

      const sent = await interaction.editReply({
        content: "> Select a user to invite to your temporary voice channel",
        components: [row],
      });

      const collector = sent.createMessageComponentCollector({
        componentType: ComponentType.UserSelect,
        time: 60_000,
      });

      collector.on("collect", async (selectInteraction) => {
        await selectInteraction.deferReply({ flags: MessageFlags.Ephemeral });

        let sentInviteMessages: User[] = [];
        try {
          const users = selectInteraction.users;
          const userNotBan = users.filter(async (user) => {
            const userSettings = await UserSettings.findOne({
              userId: user.id,
            });

            return !userSettings?.temporaryVoiceChannel.blockedUsers.includes(
              selectInteraction.id.toString()
            );
          });

          userNotBan.forEach(async (user) => {
            const confirmButton =
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId("invite-temp-voice-confirm-join")
                  .setLabel("Join")
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId("invite-temp-voice-confirm-deny")
                  .setLabel("Deny")
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId("invite-temp-voice-confirm-block")
                  .setLabel("Block")
                  .setStyle(ButtonStyle.Secondary)
              );

            const userSent = await user.send({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: selectInteraction.user.displayName,
                    iconURL: selectInteraction.user.displayAvatarURL(),
                  })
                  .setTitle(
                    "> You have been invited to join a temporary voice channel"
                  )
                  .setDescription(
                    `You have been invited to join the temporary voice channel: ${
                      userVoiceChannel!.name
                    }`
                  )
                  .setColor("#03ffbc")
                  .setTimestamp(),
              ],
              components: [confirmButton],
            });
            sentInviteMessages.push(user);

            const userCollector = userSent.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: (i) => i.user.id === user.id,
              time: 120_000,
            });

            userCollector.on("collect", async (userButtonInteraction) => {
              try {
                if (
                  !(await selectInteraction.guild?.members.fetch(
                    userButtonInteraction.user.id
                  ))
                )
                  throw {
                    name: "UserNotInGuild",
                    message: "User is not in the guild",
                  };

                if (
                  userButtonInteraction.customId ==
                  "invite-temp-voice-confirm-block"
                ) {
                  const userSettings = await UserSettings.findOne({
                    userId: userButtonInteraction.user.id,
                  });

                  if (userSettings) {
                    userSettings.temporaryVoiceChannel.blockedUsers.push(
                      selectInteraction.user.id
                    );
                    await userSettings.save();
                  } else {
                    const newUserSettings = new UserSettings({
                      userId: userButtonInteraction.user.id,
                      temporaryVoiceChannel: {
                        channelName: null,
                        blockedUsers: [selectInteraction.user.id],
                        limitUser: 0,
                      },
                    });
                    await newUserSettings.save();
                  }
                  await userSent.edit({
                    content: `You have blocked ${selectInteraction.user.displayName} from inviting you again.`,
                    embeds: [],
                    components: [],
                  });

                  return userButtonInteraction.deferUpdate();
                }

                if (
                  userButtonInteraction.customId ==
                  "invite-temp-voice-confirm-join"
                ) {
                  const userSelectedVoiceChannel =
                    selectInteraction.guild?.members.cache.get(
                      userButtonInteraction.user.id
                    )?.voice;

                  if (!userSelectedVoiceChannel)
                    return userSent.edit({
                      content: `You are not in a voice channel`,
                      embeds: [],
                      components: [],
                    });

                  await userSelectedVoiceChannel.setChannel(userVoiceChannel!);
                  await userSent.edit({
                    content: `> You have joined ${userVoiceChannel!.name}`,
                    embeds: [],
                    components: [],
                  });
                  return userButtonInteraction.deferUpdate();
                }

                if (
                  userButtonInteraction.customId ==
                  "invite-temp-voice-confirm-deny"
                )
                  return userSent.delete();
              } catch (error) {
                sendError(userButtonInteraction, error);
              }
            });
          });

          selectInteraction.editReply({
            content: `> Invited users: ${sentInviteMessages
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
