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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

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

        let sentInviteMessageUsers: User[] = [];
        let cantSendInviteMessageUsers: User[] = [];

        try {
          const users = selectInteraction.users;
          const invitePromises = [];

          for (const user of users.values()) {
            if (user.id === selectInteraction.user.id) continue;

            try {
              const userInviteSettings = await UserSettings.findOne({
                userId: user.id,
              });

              if (
                userInviteSettings?.temporaryVoiceChannel.blockedUsers.includes(
                  selectInteraction.user.id
                )
              ) {
                cantSendInviteMessageUsers.push(user);
                continue;
              }

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
                  CommonEmbedBuilder.info({
                    title: "> Invite to Temporary Voice Channel",
                    description: `You have been invited to join ${selectInteraction.user.displayName}'s temporary voice channel.`,
                  }),
                ],
                components: [confirmButton],
              });

              sentInviteMessageUsers.push(user);

              const userCollector = userSent.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (i) => i.user.id === user.id,
                time: 120_000,
              });

              userCollector.on("collect", async (userButtonInteraction) => {
                const userMember = await selectInteraction.guild?.members.fetch(
                  userButtonInteraction.user.id
                );
                const renewUserVoiceChannel = (
                  await interaction.guild!.members.fetch(
                    selectInteraction.user.id
                  )
                ).voice.channel;

                try {
                  if (!userMember)
                    throw {
                      name: "UserNotInGuild",
                      message: "User is not in the guild",
                    };

                  if (
                    userButtonInteraction.customId ==
                    "invite-temp-voice-confirm-join"
                  ) {
                    if (!renewUserVoiceChannel) {
                      return userSent.edit({
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
                      return userSent.edit({
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
                      userVoiceChannel.userLimit != 0 &&
                      userVoiceChannel.members.size >=
                        userVoiceChannel.userLimit
                    )
                      return userSent.edit({
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
                      userVoiceChannel.members.find(
                        (member) => member.id == userButtonInteraction.user.id
                      )
                    )
                      return userSent.edit({
                        content: null,
                        embeds: [
                          CommonEmbedBuilder.info({
                            title: "> Already in Channel",
                            description: "You are already in this channel.",
                          }),
                        ],
                        components: [],
                      });

                    if (!userMember.voice) {
                      return userSent.edit({
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
                      userMember.voice.channel?.guildId !=
                      userVoiceChannel.guild.id
                    ) {
                      return userSent.edit({
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

                    await userMember.voice.setChannel(userVoiceChannel!);
                    await userSent.edit({
                      content: null,
                      embeds: [
                        CommonEmbedBuilder.success({
                          title: "> Joined Channel",
                          description: `You have joined ${selectInteraction.user.displayName}'s temporary voice channel.`,
                        }),
                      ],
                      components: [],
                    });
                    return userButtonInteraction.deferUpdate();
                  }

                  if (
                    userButtonInteraction.customId ==
                    "invite-temp-voice-confirm-block"
                  ) {
                    const userSettings = await UserSettings.findOneAndUpdate(
                      {
                        userId: userButtonInteraction.user.id,
                      },
                      {
                        $setOnInsert: {
                          userId: userButtonInteraction.user.id,
                        },
                      },
                      {
                        upsert: true,
                        new: true,
                      }
                    );

                    userSettings.temporaryVoiceChannel.blockedUsers.push(
                      selectInteraction.user.id
                    );
                    await userSettings.save();

                    await userSent.edit({
                      content: null,
                      embeds: [
                        CommonEmbedBuilder.info({
                          title: "> Blocked",
                          description: `You have blocked ${selectInteraction.user.displayName} from inviting you to their temporary voice channel.`,
                        }),
                      ],
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
            } catch (error) {
              cantSendInviteMessageUsers.push(user);
              sendError(selectInteraction, error);
            }
          }

          await selectInteraction.editReply({
            content: null,
            embeds: [
              CommonEmbedBuilder.success({
                title: "> Invited Users",
                description:
                  `Invited users: ${
                    sentInviteMessageUsers
                      .map((user) => `<@${user.id}>`)
                      .join(", ") || "None"
                  }` +
                  (cantSendInviteMessageUsers.length > 0
                    ? `\nCan't send invite message to: ${cantSendInviteMessageUsers
                        .map((user) => `<@${user.id}>`)
                        .join(", ")}`
                    : ""),
              }),
            ],
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
