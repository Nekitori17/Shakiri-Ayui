import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  GuildMemberRoleManager,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { ModerationEmbedBuilder } from "../../utils/moderationEmbedBuilder";
import humanizeDuration from "humanize-duration";
import config from "../../config";
import ms from "ms";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const target = interaction.options.get("target")?.value as string;
    const duration =
      (interaction.options.get("duration")?.value as string) || "1h";
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "No reason provided";

    try {
      const msDuration = ms(duration);
      if (!msDuration)
        throw {
          name: "Invalid Duration",
          message: "Please provide a valid duration",
        };
      const strDuration = humanizeDuration(msDuration, {
        round: true,
        delimiter: " ",
      });

      const targetUser = await interaction.guild?.members.fetch(target);

      if (!targetUser)
        throw {
          name: "User Not Found",
          message: "That user does not exist in this server",
        };

      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "Can't mute Owner",
          message: "Why you would want to mute the owner of this server 🤨",
        };

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "Can't mute Me",
          message: "Why you would want to mute me 😭",
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

      const userIsMuted = targetUser.isCommunicationDisabled();

      await targetUser.timeout(msDuration, reason);
      await interaction.editReply({
        embeds: [
          ModerationEmbedBuilder.mute({
            moderator: interaction.user,
            target: targetUser,
            reason: reason,
            duration: strDuration,
            update: userIsMuted,
          }),
        ],
      });

      if (config.modules.moderator.logging) {
        if (!interaction.guild?.channels.cache.has(config.modules.moderator.loggingChannel)) return;
        const logChannel = interaction.guild?.channels.cache.get(
          config.modules.moderator.loggingChannel
        ) as TextChannel;

        if (!logChannel)
          throw {
            name: "Channel Not Found",
            message: "The logging channel was not found",
          };

        await logChannel.send({
          embeds: [
            ModerationEmbedBuilder.mute({
              target: targetUser,
              moderator: interaction.user,
              reason: reason,
              duration: strDuration,
              update: userIsMuted,
            }),
          ],
        });
      }
    } catch (error: { name: string; message: string } | any) {
      await interaction.deleteReply();
      (interaction.channel as TextChannel)?.send({
        embeds: [
          CommonEmbedBuilder.error({
            title: error.name,
            description: error.message,
          }),
        ],
      });
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
