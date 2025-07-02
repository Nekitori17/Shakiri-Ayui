import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { checkUserRolePosition } from "../../validator/checkRolePosition";
import { ModerationEmbedBuilder } from "../../helpers/embeds/moderationEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { CustomError } from "../../helpers/utils/CustomError";

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
        throw new CustomError({
          name: "UserNotFound",
          message: "That user does not exist in this server",
        });

      // Check if the target is the server owner
      if (targetUser.id === interaction.guild?.ownerId)
        throw new CustomError({
          name: "Can'tKickOwner",
          message: "Why you would want to kick the owner of this server 🤨",
          type: "warning",
        });

      // Check if the target is the bot itself
      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new CustomError({
          name: "Can'tKickMe",
          message: "Why you would want to kick me 😭",
          type: "warning",
        });

      // Get role positions for hierarchy check
      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser
      );

      // Kick the user with the specified reason
      await targetUser.kick(reasonOption || undefined);

      // Send a confirmation message
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🛴| ${targetUser.user.displayName} has been kicked`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`
            )
            .setColor("Orange"),
        ],
      });

      // Logging section
      const guildSetting = await config.modules(interaction.guildId!);
      if (guildSetting.moderator.logging) {
        if (!guildSetting.moderator.loggingChannel) return;

        // Fetch the logging channel
        const logChannel = interaction.guild?.channels.cache.get(
          guildSetting.moderator.loggingChannel
        );

        // Check if the logging channel exists
        if (!logChannel)
          throw new CustomError({
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          });

        // Send log message to the designated channel if sendable
        if (!logChannel.isSendable()) return;
        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.kick({
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
  name: "kick",
  description: "kick a user",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The target to kick",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissionsRequired: [PermissionFlagsBits.KickMembers],
};

export default command;
