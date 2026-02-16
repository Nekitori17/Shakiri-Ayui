import ms from "ms";
import prettyMs from "pretty-ms";
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
      const durationOption = interaction.options.getString("duration") || "1h";
      const reasonOption = interaction.options.getString("reason");

      const targetUser =
        await interaction.guild?.members.fetch(targetUserOption);

      if (!targetUser)
        throw new client.CustomError({
          name: "UserNotFound",
          message: "That user does not exist in this server",
          type: "warning",
        });

      if (targetUser.id === interaction.guild?.ownerId)
        throw new client.CustomError({
          name: "Can'tMuteOwner",
          message: "Why you would want to mute the owner of this server 🤨",
          type: "warning",
        });

      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new client.CustomError({
          name: "Can'tMuteMe",
          message: "Why you would want to mute me 😭",
          type: "warning",
        });

      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser,
      );

      const msDuration = ms(durationOption as ms.StringValue);
      if (!msDuration)
        throw new client.CustomError({
          name: "InvalidDuration",
          message: "Please provide a valid duration",
        });

      const strDuration = prettyMs(msDuration);

      const userIsMuted = targetUser.isCommunicationDisabled();

      await targetUser.timeout(msDuration, reasonOption || undefined);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🤫| ${targetUser.user.displayName} has been muted about ${strDuration}`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`,
            )
            .setColor("Yellow"),
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
            ModerationEmbedBuilder.mute({
              target: targetUser,
              moderator: interaction.user,
              reason: reasonOption || "No reason provided",
              duration: strDuration,
              update: userIsMuted,
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
  name: "mute",
  description: "Mute a user",
  disabled: false,
  deleted: false,
  devOnly: false,
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
  useInDm: false,
  requiredVoiceChannel: false,
  userPermissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissionsRequired: [PermissionFlagsBits.MuteMembers],
};

export default command;
