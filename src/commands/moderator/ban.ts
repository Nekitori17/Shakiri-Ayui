import config from "../../config";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMemberRoleManager,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import sendError from "../../utils/sendError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { ModerationEmbedBuilder } from "../../utils/moderationEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    await interaction.deferReply();
    const target = interaction.options.get("target")?.value as string;
    const reason = interaction.options.get("reason")?.value as string;

    try {
      const targetUser = await interaction.guild?.members.fetch(target);

      if (!targetUser)
        throw {
          name: "User Not Found",
          message: "That user does not exist in this server",
        };

      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "Can't Ban Owner",
          message: "Why you would want to ban the owner of this server 🤨",
        };

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "Can't Ban Me",
          message: "Why you would want to ban me 😭",
        };

      const requestUserRolePosition = (
        interaction.member?.roles as GuildMemberRoleManager
      ).highest.position;
      const targetUserRolePosition = targetUser.roles.highest.position;
      const botRolePosition =
        interaction.guild?.members.me?.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition)
        throw {
          name: "Insufficient Permissions",
          message: "They have the same/higher role than you",
        };

      if (targetUserRolePosition >= botRolePosition!)
        throw {
          name: "Insufficient Permissions",
          message: "They have the same/higher role than me",
        };

      await targetUser.ban({ reason });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🔨| **${targetUser.user.displayName}** has been banned`,
            })
            .setDescription(`**Reason**: ${reason || "No reason provided"}`)
            .setColor("Red"),
        ],
      });

      const settings = await config.modules(interaction.guildId!);
      if (settings.moderator.logging) {
        if (!settings.moderator.loggingChannel) return;

        const logChannel = interaction.guild?.channels.cache.get(
          settings.moderator.loggingChannel
        ) as TextChannel;

        if (!logChannel)
          throw {
            name: "Channel Not Found",
            message: "The logging channel was not found",
          };

        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.ban({
              target: targetUser,
              moderator: interaction.user,
              reason: reason || "No reason provided",
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
  botPermissions: [PermissionFlagsBits.BanMembers],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
};

export default command;
