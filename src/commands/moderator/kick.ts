import config from "../../config";
import {
  ApplicationCommandOptionType,
  GuildMemberRoleManager,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import CommonEmbedBuilder from "../../utils/commonEmbedBuilder";
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
            reason: reason || "No reason provided",
          }),
        ],
      });

      const settings = await config.modules(interaction.guildId!);
      if (settings.moderator?.logging) {
        if (
          !interaction.guild?.channels.cache.has(
            settings.moderator?.loggingChannel || ""
          )
        )
          return;
        const logChannel = interaction.guild?.channels.cache.get(
          settings.moderator?.loggingChannel || ""
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
              reason: reason || "No reason provided",
            }),
          ],
        });
      }
    } catch (error: { name: string; message: string } | any) {
      interaction.editReply({
        content: null,
        components: undefined,
        files: undefined,
        attachments: undefined,
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
