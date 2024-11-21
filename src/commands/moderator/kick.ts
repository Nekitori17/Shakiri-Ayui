import {
  ApplicationCommandOptionType,
  Client,
  GuildMemberRoleManager,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CommandInteraction } from "discord.js";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
import { ModerationEmbedBuilder } from "../../utils/moderationEmbedBuilder";
import config from "../../config";

const command: CommandInterface = {
  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply();
    const target = interaction.options.get("target")?.value as string;

    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "No reason provided";

    try {
      const targetUser = await interaction.guild?.members.fetch(target);

      if (!targetUser)
        throw {
          name: "User Not Found",
          message: "That user does not exist in this server",
        };

      if (targetUser.id === interaction.guild?.ownerId)
        throw {
          name: "Can't Kick Owner",
          message: "Why you would want to kick the owner of this server 🤨",
        };

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw {
          name: "Can't kick Me",
          message: "Why you would want to kick me 😭",
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

      await targetUser.kick(reason);

      await interaction.editReply({
        embeds: [
          ModerationEmbedBuilder.kick({
            target: targetUser,
            moderator: interaction.user,
            reason: reason,
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
            ModerationEmbedBuilder.kick({
              target: targetUser,
              moderator: interaction.user,
              reason: reason,
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
  name: "kick",
  description: "kick a user",
  deleted: false,
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
  botPermissions: [PermissionFlagsBits.KickMembers],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
};

export default command;
