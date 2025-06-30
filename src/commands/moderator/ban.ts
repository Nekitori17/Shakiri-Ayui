import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMemberRoleManager,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { ModerationEmbedBuilder } from "../../helpers/embeds/moderationEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const targetUserOption = interaction.options.getUser("target")!;
    const reasonOption = interaction.options.getString("reason");

    try {
      // Fetch the target user as a guild member
      const targetUser = await interaction.guild?.members.fetch(
        targetUserOption
      );

      // Check if the target user exists in the server
      if (!targetUser)
        throw {
          name: "UserNotFound",
          message: "That user does not exist in this server",
        };

      // Check if the target is the server owner
      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "CantBanOwner",
          message: "Why you would want to ban the owner of this server 🤨",
          type: "warning",
        };

      // Check if the target is the bot itself
      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "CantBanMe",
          message: "Why you would want to ban me 😭",
          type: "warning",
        };

      // Get role positions for hierarchy check
      const requestUserRolePosition = (
        interaction.member?.roles as GuildMemberRoleManager
      ).highest.position;
      const targetUserRolePosition = targetUser.roles.highest.position;
      const botRolePosition =
        interaction.guild!.members.me!.roles.highest.position;

      // Check if the command user has a higher role than the target
      if (targetUserRolePosition >= requestUserRolePosition)
        throw {
          name: "InsufficientPermissions",
          message: "They have the same/higher role than you",
          type: "warning",
        };

      // Check if the bot has a higher role than the target
      if (targetUserRolePosition >= botRolePosition!)
        throw {
          name: "InsufficientPermissions",
          message: "They have the same/higher role than me",
          type: "warning",
        };

      // Ban the user with the specified reason
      await targetUser.ban({ reason: reasonOption || undefined });

      // Send a confirmation message
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🔨| ${targetUser.user.displayName} has been banned`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`
            )
            .setColor("Red"),
        ],
      });

      // Logging section
      const guildSetting = await config.modules(interaction.guildId!);
      if (guildSetting.moderator.logging) {
        if (!guildSetting.moderator.loggingChannel) return;

        const logChannel = await interaction.guild?.channels.fetch(
          guildSetting.moderator.loggingChannel
        );

        if (!logChannel) {
          throw {
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          };
        }

        // Send log message to the designated channel
        if (!logChannel.isSendable()) return;
        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.ban({
              target: targetUser,
              moderator: interaction.user,
              reason: reasonOption || "No reason provided",
            }),
          ],
        });
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "ban",
  description: "Ban a user",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The target to ban",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissionsRequired: [PermissionFlagsBits.BanMembers],
};

export default command;
