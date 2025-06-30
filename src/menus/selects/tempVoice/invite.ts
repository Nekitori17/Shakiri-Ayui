import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
  MessageFlags,
  User,
  UserSelectMenuBuilder,
} from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import UserSettings from "../../../models/UserSettings";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    // Get the user's voice channel
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Check if the temporary voice channel belongs to the interacting user
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id))
        throw {
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        };

      const inviteUserSelectMenuRow =
        // Create an ActionRow with a UserSelectMenu for inviting users
        new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
          new UserSelectMenuBuilder()
            .setCustomId("temp-voice-invite")
            .setPlaceholder("Select a user to invite")
            .setMinValues(1)
            .setMaxValues(10)
        );

      // Edit the deferred reply to display the user selection menu
      const inviteUserSelectReply = await interaction.editReply({
        content: "> Select a user to invite to your temporary voice channel",
        components: [inviteUserSelectMenuRow],
      });

      // Create a message component collector for the user selection menu
      const inviteUserSelectCollector =
        inviteUserSelectReply.createMessageComponentCollector({
          componentType: ComponentType.UserSelect,
          time: 60_000,
        });

      inviteUserSelectCollector.on(
        "collect",
        async (inviteUserSelectInteraction) => {
          // Initialize arrays to store users for whom invite messages were sent or not
          let sentInviteMessageUsers: User[] = [];
          let cantSendInviteMessageUsers: User[] = [];

          try {
            await inviteUserSelectInteraction.deferReply({
              flags: MessageFlags.Ephemeral,
            });

            // Iterate over selected users to send invites
            const invitedUsers = inviteUserSelectInteraction.users;
            for (const invitedUser of invitedUsers.values()) {
              // Skip if the user is the inviter or a bot
              if (invitedUser.id === inviteUserSelectInteraction.user.id)
                continue;
              if (invitedUser.bot) continue;

              try {
                const inviteUserSetting = await UserSettings.findOne({
                  userId: invitedUser.id,
                });

                // Check if the invited user has blocked the inviter
                if (
                  inviteUserSetting?.temporaryVoiceChannel.blockedUsers.includes(
                    inviteUserSelectInteraction.user.id
                  )
                ) {
                  cantSendInviteMessageUsers.push(invitedUser);
                  continue;
                }

                // Create buttons for the invite message
                const confirmButtonRow =
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

                // Send the invite message to the invited user
                const inviteUserMessage = await invitedUser.send({
                  embeds: [
                    CommonEmbedBuilder.info({
                      title: "> Invite to Temporary Voice Channel",
                      description: `You have been invited to join ${inviteUserSelectInteraction.user.displayName}'s temporary voice channel.`,
                    }),
                  ],
                  components: [confirmButtonRow],
                });

                // Add the user to the list of successfully invited users
                sentInviteMessageUsers.push(invitedUser);

                const inviteUserMessageCollector =
                  // Create a collector for button interactions on the invite message
                  inviteUserMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: (i) => i.user.id === invitedUser.id,
                    time: 120_000,
                  });

                inviteUserMessageCollector.on(
                  "collect",
                  async (inviteUserButtonInteraction) => {
                    // Fetch the invited member from the guild
                    const invitedUserMember =
                      await inviteUserSelectInteraction.guild?.members.fetch(
                        inviteUserButtonInteraction.user.id
                      );

                    try {
                      // Check if the user is in the guild
                      if (!invitedUserMember)
                        throw {
                          name: "UserNotInGuild",
                          message: "User is not in the guild",
                        };

                      const renewUserVoiceChannel =
                        // Fetch the current state of the inviter's voice channel
                        (
                          await interaction.guild!.members.fetch(
                            inviteUserSelectInteraction.user.id
                          )
                        ).voice.channel;

                      if (
                        // Handle "Join" button click
                        inviteUserButtonInteraction.customId ==
                        "invite-temp-voice-confirm-join"
                      ) {
                        if (!renewUserVoiceChannel) {
                          return inviteUserMessage.edit({
                            content: null,
                            embeds: [
                              CommonEmbedBuilder.info({
                                title: "> Channel Deleted",
                                description:
                                  "The channel has been deleted by the owner.",
                              }),
                            ],
                            components: [],
                          });
                        }

                        if (userVoiceChannel.id != renewUserVoiceChannel.id) {
                          // Check if the channel has changed
                          return inviteUserMessage.edit({
                            content: null,
                            embeds: [
                              CommonEmbedBuilder.info({
                                title: "> Channel Changed",
                                description:
                                  "The channel has been changed by the owner.",
                              }),
                            ],
                            components: [],
                          });
                        }

                        if (
                          // Check if the channel is full
                          userVoiceChannel.userLimit != 0 &&
                          userVoiceChannel.members.size >=
                            userVoiceChannel.userLimit
                        )
                          return inviteUserMessage.edit({
                            content: null,
                            embeds: [
                              CommonEmbedBuilder.info({
                                title: "> Channel Full",
                                description:
                                  "The channel is full. Please try again later.",
                              }),
                            ],
                            components: [],
                          });

                        if (
                          // Check if the user is already in the channel
                          userVoiceChannel.members.find(
                            (member) =>
                              member.id == inviteUserButtonInteraction.user.id
                          )
                        )
                          return inviteUserMessage.edit({
                            content: null,
                            embeds: [
                              CommonEmbedBuilder.info({
                                title: "> Already in Channel",
                                description: "You are already in this channel.",
                              }),
                            ],
                            components: [],
                          });

                        if (!invitedUserMember.voice.channel) {
                          // Check if the invited user is in a voice channel
                          return inviteUserMessage.edit({
                            content: null,
                            embeds: [
                              CommonEmbedBuilder.info({
                                title: "> Not in Voice Channel",
                                description:
                                  "You are not in a voice channel. Please join a voice channel and try again." +
                                  "\n\n" +
                                  "Or you can try to join by this link" +
                                  "\n" +
                                  (await userVoiceChannel.createInvite()).url,
                              }),
                            ],
                            components: [],
                          });
                        }

                        if (
                          // Check if the invited user is in the same guild
                          invitedUserMember.voice.channel?.guildId !=
                          userVoiceChannel.guild.id
                        ) {
                          return inviteUserMessage.edit({
                            content: null,
                            embeds: [
                              CommonEmbedBuilder.info({
                                title: "> Not in Same Guild",
                                description:
                                  "You are not in the same guild as the owner of this channel." +
                                  "\n\n" +
                                  "Or you can try to join by this link" +
                                  "\n" +
                                  (await userVoiceChannel.createInvite()).url,
                              }),
                            ],
                            components: [],
                          });
                        }

                        // Move the invited user to the temporary voice channel
                        await invitedUserMember.voice.setChannel(
                          userVoiceChannel
                        );

                        await inviteUserMessage.edit({
                          content: null,
                          embeds: [
                            CommonEmbedBuilder.success({
                              title: "> Joined Channel",
                              description: `You have joined ${inviteUserSelectInteraction.user.displayName}'s temporary voice channel.`,
                            }),
                          ],
                          components: [],
                        });

                        return inviteUserButtonInteraction.deferUpdate();
                      }

                      if (
                        // Handle "Block" button click
                        inviteUserButtonInteraction.customId ==
                        "invite-temp-voice-confirm-block"
                      ) {
                        const userSettings =
                          await UserSettings.findOneAndUpdate(
                            {
                              userId: inviteUserButtonInteraction.user.id,
                            },
                            {
                              $setOnInsert: {
                                userId: inviteUserButtonInteraction.user.id,
                              },
                            },
                            {
                              upsert: true,
                              new: true,
                            }
                          );

                        // Add the inviter to the invited user's blocked list
                        userSettings.temporaryVoiceChannel.blockedUsers.push(
                          inviteUserSelectInteraction.user.id
                        );
                        await userSettings.save();

                        await inviteUserMessage.edit({
                          content: null,
                          embeds: [
                            CommonEmbedBuilder.info({
                              title: "> Blocked",
                              description: `You have blocked ${inviteUserSelectInteraction.user.displayName} from inviting you to their temporary voice channel.`,
                            }),
                          ],
                          components: [],
                        });

                        return inviteUserButtonInteraction.deferUpdate();
                      }

                      if (
                        // Handle "Deny" button click
                        inviteUserButtonInteraction.customId ==
                        "invite-temp-voice-confirm-deny"
                      )
                        return inviteUserMessage.delete();
                    } catch (error) {
                      sendError(inviteUserButtonInteraction, error);
                    }
                  }
                );
              } catch (error) {
                cantSendInviteMessageUsers.push(invitedUser);
                sendError(inviteUserSelectInteraction, error);
              }
            }

            // Edit the reply to confirm the invited users
            await inviteUserSelectInteraction.editReply({
              content: null,
              embeds: [
                CommonEmbedBuilder.success({
                  title: "> Invited Users",
                  description:
                    `Invited users: ${
                      sentInviteMessageUsers.join(", ") || "None"
                    }` +
                    (cantSendInviteMessageUsers.length > 0
                      ? `\nCan't send invite message to: ${cantSendInviteMessageUsers.join(
                          ", "
                        )}`
                      : ""),
                }),
              ],
              components: [],
            });
          } catch (error) {
            sendError(inviteUserSelectInteraction, error, true);
          }
        }
      );
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
