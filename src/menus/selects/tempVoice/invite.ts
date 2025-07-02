import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
  MessageFlags,
  User,
  UserSelectMenuBuilder,
  ButtonInteraction,
  UserSelectMenuInteraction,
  VoiceBasedChannel,
} from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import UserSettings from "../../../models/UserSettings";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

// Helper function to create invite buttons
function createInviteButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
}

// Helper function to check if user is blocked
async function isUserBlocked(
  invitedUserId: string,
  inviterId: string
): Promise<boolean> {
  const inviteUserSetting = await UserSettings.findOne({
    userId: invitedUserId,
  });
  return (
    inviteUserSetting?.temporaryVoiceChannel.blockedUsers.includes(inviterId) ||
    false
  );
}

// Helper function to handle join button logic
async function handleJoinButton(
  interaction: ButtonInteraction,
  inviteMessage: any,
  originalVoiceChannel: VoiceBasedChannel,
  inviterId: string
) {
  const invitedMember = await interaction.guild?.members.fetch(
    interaction.user.id
  );
  if (!invitedMember) {
    throw new CustomError({
      name: "UserNotInGuild",
      message: "User is not in the guild",
    });
  }

  // Get current state of inviter's voice channel
  const currentInviterMember = await interaction.guild!.members.fetch(
    inviterId
  );
  const currentVoiceChannel = currentInviterMember.voice.channel;

  // Check if channel was deleted
  if (!currentVoiceChannel) {
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Channel Deleted",
          description: "The channel has been deleted by the owner.",
        }),
      ],
      components: [],
    });
  }

  // Check if channel changed
  if (originalVoiceChannel.id !== currentVoiceChannel.id) {
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Channel Changed",
          description: "The channel has been changed by the owner.",
        }),
      ],
      components: [],
    });
  }

  // Check if channel is full
  if (
    originalVoiceChannel.userLimit !== 0 &&
    originalVoiceChannel.members.size >= originalVoiceChannel.userLimit
  ) {
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Channel Full",
          description: "The channel is full. Please try again later.",
        }),
      ],
      components: [],
    });
  }

  // Check if user is already in channel
  if (originalVoiceChannel.members.has(interaction.user.id)) {
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Already in Channel",
          description: "You are already in this channel.",
        }),
      ],
      components: [],
    });
  }

  // Check if user is in a voice channel
  if (!invitedMember.voice.channel) {
    const inviteUrl = await originalVoiceChannel.createInvite();
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Not in Voice Channel",
          description: `You are not in a voice channel. Please join a voice channel and try again.\n\nOr you can try to join by this link\n${inviteUrl.url}`,
        }),
      ],
      components: [],
    });
  }

  // Check if user is in same guild
  if (invitedMember.voice.channel?.guildId !== originalVoiceChannel.guild.id) {
    const inviteUrl = await originalVoiceChannel.createInvite();
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Not in Same Guild",
          description: `You are not in the same guild as the owner of this channel.\n\nOr you can try to join by this link\n${inviteUrl.url}`,
        }),
      ],
      components: [],
    });
  }

  // Move user to channel
  await invitedMember.voice.setChannel(originalVoiceChannel);

  await inviteMessage.edit({
    content: null,
    embeds: [
      CommonEmbedBuilder.success({
        title: "> Joined Channel",
        description: `You have joined the temporary voice channel.`,
      }),
    ],
    components: [],
  });

  return interaction.deferUpdate();
}

// Helper function to handle block button
async function handleBlockButton(
  interaction: ButtonInteraction,
  inviteMessage: any,
  inviterId: string,
  inviterDisplayName: string
) {
  const userSettings = await UserSettings.findOneAndUpdate(
    { userId: interaction.user.id },
    { $setOnInsert: { userId: interaction.user.id } },
    { upsert: true, new: true }
  );

  userSettings.temporaryVoiceChannel.blockedUsers.push(inviterId);
  await userSettings.save();

  await inviteMessage.edit({
    content: null,
    embeds: [
      CommonEmbedBuilder.info({
        title: "> Blocked",
        description: `You have blocked ${inviterDisplayName} from inviting you to their temporary voice channel.`,
      }),
    ],
    components: [],
  });

  return interaction.deferUpdate();
}

// Helper function to handle button interactions
async function handleButtonInteraction(
  buttonInteraction: ButtonInteraction,
  inviteMessage: any,
  originalVoiceChannel: VoiceBasedChannel,
  inviterId: string,
  inviterDisplayName: string
) {
  const { customId } = buttonInteraction;

  if (customId === "invite-temp-voice-confirm-join") {
    return handleJoinButton(
      buttonInteraction,
      inviteMessage,
      originalVoiceChannel,
      inviterId
    );
  }

  if (customId === "invite-temp-voice-confirm-block") {
    return handleBlockButton(
      buttonInteraction,
      inviteMessage,
      inviterId,
      inviterDisplayName
    );
  }

  if (customId === "invite-temp-voice-confirm-deny") {
    return inviteMessage.delete();
  }
}

// Helper function to send invite to single user
async function sendInviteToUser(
  invitedUser: User,
  inviterUser: User,
  originalVoiceChannel: VoiceBasedChannel,
  sentUsers: User[],
  cantSendUsers: User[]
) {
  // Skip if user is inviter or bot
  if (invitedUser.id === inviterUser.id || invitedUser.bot) {
    return;
  }

  try {
    // Check if user is blocked
    if (await isUserBlocked(invitedUser.id, inviterUser.id)) {
      cantSendUsers.push(invitedUser);
      return;
    }

    // Send invite message
    const inviteMessage = await invitedUser.send({
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Invite to Temporary Voice Channel",
          description: `You have been invited to join ${inviterUser.displayName}'s temporary voice channel.`,
        }),
      ],
      components: [createInviteButtons()],
    });

    sentUsers.push(invitedUser);

    // Create collector for button interactions
    const collector = inviteMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === invitedUser.id,
      time: 120_000,
    });

    collector.on("collect", async (buttonInteraction) => {
      try {
        await handleButtonInteraction(
          buttonInteraction,
          inviteMessage,
          originalVoiceChannel,
          inviterUser.id,
          inviterUser.displayName
        );
      } catch (error) {
        sendError(buttonInteraction, error);
      }
    });
  } catch (error) {
    cantSendUsers.push(invitedUser);
  }
}

// Helper function to handle user selection
async function handleUserSelection(
  selectInteraction: UserSelectMenuInteraction,
  originalVoiceChannel: VoiceBasedChannel
) {
  const sentUsers: User[] = [];
  const cantSendUsers: User[] = [];

  await selectInteraction.deferReply({ flags: MessageFlags.Ephemeral });

  // Send invites to all selected users
  await Promise.all(
    Array.from(selectInteraction.users.values()).map((user) =>
      sendInviteToUser(
        user,
        selectInteraction.user,
        originalVoiceChannel,
        sentUsers,
        cantSendUsers
      )
    )
  );

  // Build result message
  let description = `Invited users: ${sentUsers.join(", ") || "None"}`;
  if (cantSendUsers.length > 0) {
    description += `\nCan't send invite message to: ${cantSendUsers.join(
      ", "
    )}`;
  }

  // Edit the reply to confirm the invited users
  await selectInteraction.editReply({
    content: null,
    embeds: [
      CommonEmbedBuilder.success({
        title: "> Invited Users",
        description,
      }),
    ],
    components: [],
  });
}

const select: SelectMenuInterface = {
  async execute(interaction, client) {
    const userVoiceChannel = (interaction.member as GuildMember).voice.channel!;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Check ownership
      if (!checkOwnTempVoice(userVoiceChannel.id, interaction.user.id)) {
        throw new CustomError({
          name: "NotOwnTempVoiceError",
          message: "This temporary voice channel does not belong to you.",
        });
      }

      // Create user select menu
      const selectMenuRow =
        new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
          new UserSelectMenuBuilder()
            .setCustomId("temp-voice-invite")
            .setPlaceholder("Select a user to invite")
            .setMinValues(1)
            .setMaxValues(10)
        );

      const reply = await interaction.editReply({
        content: "> Select a user to invite to your temporary voice channel",
        components: [selectMenuRow],
      });

      // Create collector
      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.UserSelect,
        time: 60_000,
      });

      collector.on("collect", async (selectInteraction) => {
        try {
          await handleUserSelection(selectInteraction, userVoiceChannel);
        } catch (error) {
          sendError(selectInteraction, error, true);
        }
      });
    } catch (error) {
      sendError(interaction, error, true);
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
