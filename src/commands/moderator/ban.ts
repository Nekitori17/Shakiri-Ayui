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
          name: "CantBanOwner",
          message: "Why you would want to ban the owner of this server 🤨",
          type: "warning",
        });

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new client.CustomError({
          name: "CantBanMe",
          message: "Why you would want to ban me 😭",
          type: "warning",
        });

      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser,
      );

      await targetUser.ban({ reason: reasonOption || undefined });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🔨| ${targetUser.user.displayName} has been banned`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`,
            )
            .setColor("Red"),
        ],
      });

      // Logging section
      const guildSetting = await client.getGuildSetting(interaction.guildId!);
      if (guildSetting.moderator.loggingEnabled) {
        if (!guildSetting.moderator.loggingChannel) return;

        const logChannel = await interaction.guild?.channels.fetch(
          guildSetting.moderator.loggingChannel,
        );

        if (!logChannel) {
          throw new client.CustomError({
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          });
        }

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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "ban",
  description: "Ban a user",
  disabled: false,
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
