import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { checkUserRolePosition } from "../../helpers/discord/validators/checkRolePosition";
import { ModerationEmbedBuilder } from "../../helpers/discord/embeds/moderationEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("target", true);
      const reasonOption = interaction.options.getString("reason");

      const targetUser =
        await interaction.guild?.members.fetch(targetUserOption);

      if (!targetUser)
        throw new client.CustomError({
          name: "UserNotFound",
          message: "That user does not exist in this server",
        });

      if (targetUser.id === interaction.guild?.ownerId)
        throw new client.CustomError({
          name: "OwnerIsMuted?",
          message: "Nahhh. I don't think owner can be muted",
          type: "warning",
        });

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new client.CustomError({
          name: "OhhhMyGod...",
          message: "I even can't do that",
          type: "warning",
        });

      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser,
      );

      if (!targetUser?.isCommunicationDisabled())
        throw new client.CustomError({
          name: "UserIsNotMuted",
          message: "This user is not muted",
          type: "warning",
        });

      await targetUser.timeout(null, reasonOption || undefined);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🥶| ${targetUser.user.displayName} has been unmuted`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`,
            )
            .setColor("Green"),
        ],
      });

      // Logging section
      const settings = await client.getGuildSetting(interaction.guildId!);
      if (settings.moderator.loggingEnabled) {
        if (!settings.moderator.loggingChannel) return;

        const logChannel = interaction.guild?.channels.cache.get(
          settings.moderator.loggingChannel,
        );

        if (!logChannel)
          throw new client.CustomError({
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          });

        if (!logChannel.isSendable()) return;
        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.un({
              action: "Unmute",
              moderator: interaction.user,
              reason: reasonOption || "No reason provided",
              target: targetUser,
            }),
          ],
        });
      }

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "unmute",
  description: "Unmute a user",
  disabled: false,
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "target",
      description: "The user to unmute",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the unmute",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissionsRequired: [PermissionFlagsBits.MuteMembers],
};

export default command;
