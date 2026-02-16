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
          name: "Can'tKickOwner",
          message: "Why you would want to kick the owner of this server 🤨",
          type: "warning",
        });

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new client.CustomError({
          name: "Can'tKickMe",
          message: "Why you would want to kick me 😭",
          type: "warning",
        });

      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser,
      );

      await targetUser.kick(reasonOption || undefined);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🛴| ${targetUser.user.displayName} has been kicked`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`,
            )
            .setColor("Orange"),
        ],
      });

      // Logging section
      const guildSetting = await client.getGuildSetting(interaction.guildId!);
      if (guildSetting.moderator.loggingEnabled) {
        if (!guildSetting.moderator.loggingChannel) return;

        const logChannel = interaction.guild?.channels.cache.get(
          guildSetting.moderator.loggingChannel,
        );

        if (!logChannel)
          throw new client.CustomError({
            name: "ChannelNotFound",
            message: "The logging channel was not found",
          });

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

      return true;
    } catch (error) {
      client.interactionErrorHandler(interaction, error);

      return false;
    }
  },
  name: "kick",
  description: "kick a user",
  disabled: false,
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
