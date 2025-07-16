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
  Message,
  Guild,
} from "discord.js";
import UserSettings from "../../../models/UserSettings";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkOwnTempVoice from "../../../validator/checkOwnTempVoice";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

// Helper function to create a button for joining a channel via a link
function createJoinChannelLinkButton(link: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Join")
      .setStyle(ButtonStyle.Link)
      .setURL(link)
  );
}

// Helper function to create invite buttons
function createInviteButtons() {
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
async function isUserBlocked(invitedUserId: string, inviterId: string) {
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
  inviteMessage: Message,
  originalVoiceChannel: VoiceBasedChannel,
  inviter: User,
  inviterGuild: Guild
) {
  const invitedMember = await inviterGuild.members.fetch(interaction.user.id);

  if (!invitedMember) {
    throw new CustomError({
      name: "UserNotInGuild",
      message: "User is not in the guild",
    });
  }

  // Get current state of inviter's voice channel
  const currentInviterMember = await inviterGuild.members.fetch(inviter.id);
  const currentVoiceChannel = currentInviterMember.voice.channel;

  // Check if channel was deleted
  if (!currentVoiceChannel) {
    await interaction.deferUpdate();
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
    await interaction.deferUpdate();
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
    await interaction.deferUpdate();
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
    await interaction.deferUpdate();
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
    await interaction.deferUpdate();
    return inviteMessage.edit({
      content: null,
      embeds: [
        CommonEmbedBuilder.info({
          title: "> Not in Voice Channel Or Same Guild",
          description:
            `You are not in a voice channel or you are not in the same guild as the temporary voice channel.` +
            "\n" +
            `Please join a voice channel and try again.` +
            "\n\n" +
            `Or you can try to join by the button in bellow`,
        }),
      ],
      components: [createJoinChannelLinkButton(inviteUrl.url)],
    });
  }

  // Move user to channel
  await invitedMember.voice.setChannel(originalVoiceChannel);

  await inviteMessage.edit({
    content: null,
    embeds: [
      CommonEmbedBuilder.success({
        title: "> Joined Channel",
        description: `You have joined ${inviter}'s temporary voice channel.`,
      }),
    ],
    components: [],
  });

  return interaction.deferUpdate();
}

// Helper function to handle block button
async function handleBlockButton(
  interaction: ButtonInteraction,
  inviteMessage: Message,
  inviter: User
) {
  const userSettings = await UserSettings.findOneAndUpdate(
    { userId: interaction.user.id },
    { $setOnInsert: { userId: interaction.user.id } },
    { upsert: true, new: true }
  );

  userSettings.temporaryVoiceChannel.blockedUsers.push(inviter.id);
  await userSettings.save();

  await inviteMessage.edit({
    content: null,
    embeds: [
      CommonEmbedBuilder.info({
        title: "> Blocked",
        description: `You have blocked ${inviter} from inviting you to their temporary voice channel.`,
      }),
    ],
    components: [],
  });

  return interaction.deferUpdate();
}

// Helper function to handle button interactions
async function handleButtonInteraction(
  inviteButtonInteraction: ButtonInteraction,
  inviteMessage: Message,
  originalVoiceChannel: VoiceBasedChannel,
  inviter: User,
  inviterGuild: Guild
) {
  const { customId } = inviteButtonInteraction;

  if (customId === "invite-temp-voice-confirm-join") {
    return handleJoinButton(
      inviteButtonInteraction,
      inviteMessage,
      originalVoiceChannel,
      inviter,
      inviterGuild
    );
  }

  if (customId === "invite-temp-voice-confirm-block") {
    return handleBlockButton(inviteButtonInteraction, inviteMessage, inviter);
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
  inviterGuild: Guild,
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

    // Create inviteSelectCollector for button interactions
    const inviteMessageCollector =
      inviteMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === invitedUser.id,
        time: 120_000,
      });

    inviteMessageCollector.on("collect", async (inviteButtonInteraction) => {
      try {
        await handleButtonInteraction(
          inviteButtonInteraction,
          inviteMessage,
          originalVoiceChannel,
          inviterUser,
          inviterGuild
        );
      } catch (error) {
        handleInteractionError(inviteButtonInteraction, error);
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
        selectInteraction.guild!,
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

  // Edit the inviteSelectReply to confirm the invited users
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

      const inviteSelectReply = await interaction.editReply({
        content: "> Select a user to invite to your temporary voice channel",
        components: [selectMenuRow],
      });

      // Create inviteSelectCollector
      const inviteSelectCollector =
        inviteSelectReply.createMessageComponentCollector({
          componentType: ComponentType.UserSelect,
          time: 60_000,
        });

      inviteSelectCollector.on("collect", async (inviteSelectInteraction) => {
        try {
          await handleUserSelection(inviteSelectInteraction, userVoiceChannel);
        } catch (error) {
          handleInteractionError(inviteSelectInteraction, error);
        }
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);
      
      return false;
    }
  },
  disabled: false,
  devOnly: false,
  requiredVoiceChannel: true,
};

export default select;
