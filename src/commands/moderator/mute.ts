import ms from "ms";
import config from "../../config";
import prettyMs from "pretty-ms";
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
    const target = interaction.options.get("target")?.value as string;
    const duration =
      (interaction.options.get("duration")?.value as string) || "1h";
    const reason = interaction.options.get("reason")?.value as string;

    try {
      const msDuration = ms(duration as ms.StringValue);
      if (!msDuration)
        throw {
          name: "InvalidDuration",
          message: "Please provide a valid duration",
        };
      const strDuration = prettyMs(msDuration);

      const targetUser = await interaction.guild?.members.fetch(target);

      if (!targetUser)
        throw {
          name: "UserNotFound",
          message: "That user does not exist in this server",
          type: "warning",
        };

      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "Can'tMuteOwner",
          message: "Why you would want to mute the owner of this server 🤨",
          type: "warning",
        };

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "Can'tMuteMe",
          message: "Why you would want to mute me 😭",
          type: "warning",
        };

      const requestUserRolePosition = (
        interaction.member?.roles as GuildMemberRoleManager
      ).highest.position;
      const targetUserRolePosition = targetUser.roles.highest.position;
      const botRolePosition =
        interaction.guild?.members.me?.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition)
        throw {
          name: "InsufficientPermissions",
          message: "They have the same/higher role than you",
          type: "warning",
        };

      if (targetUserRolePosition >= botRolePosition!)
        throw {
          name: "InsufficientPermissions",
          message: "They have the same/higher role than me",
          type: "warning",
        };

      const userIsMuted = targetUser.isCommunicationDisabled();

      await targetUser.timeout(msDuration, reason);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🤫| **${targetUser.user.displayName}** has been muted about ${strDuration}`,
            })
            .setDescription(`**Reason**: ${reason || "No reason provided"}`)
            .setColor("Yellow"),
        ],
      });

      const settings = await config.modules(interaction.guildId!);
      if (settings.moderator.logging) {
        if (!settings.moderator.loggingChannel) return;

        const logChannel = interaction.guild?.channels.cache.get(
          settings.moderator.loggingChannel
        );

        if (!logChannel)
          throw {
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          };

        if (!logChannel.isSendable()) return;
        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.mute({
              target: targetUser,
              moderator: interaction.user,
              reason: reason || "No reason provided",
              duration: strDuration,
              update: userIsMuted,
            }),
          ],
        });
      }
    } catch (error) {
      sendError(interaction, error);
    }
  },
  name: "mute",
  description: "Mute a user",
  deleted: false,
  options: [
    {
      name: "target",
      description: "The user to mute",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "duration",
      description: "The duration of the mute (Default: 1h)",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "reason",
      description: "The reason for the mute",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};

export default command;
