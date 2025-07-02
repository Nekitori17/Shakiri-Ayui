import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMemberRoleManager,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { checkUserRolePosition } from "../../validator/checkRolePosition";
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
      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser
      );

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
