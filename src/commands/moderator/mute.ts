import ms from "ms";
import config from "../../config";
import prettyMs from "pretty-ms";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import sendError from "../../helpers/utils/sendError";
import { CustomError } from "../../helpers/utils/CustomError";
import { checkUserRolePosition } from "../../validator/checkRolePosition";
import { ModerationEmbedBuilder } from "../../helpers/embeds/moderationEmbedBuilder";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const targetUserOption = interaction.options.getUser("target", true);
      const durationOption = interaction.options.getString("duration") || "1h";
      const reasonOption = interaction.options.getString("reason");

      // Fetch the target user as a guild member
      const targetUser = await interaction.guild?.members.fetch(
        targetUserOption
      );

      // Check if the target user exists in the server
      if (!targetUser)
        throw new CustomError({
          name: "UserNotFound",
          message: "That user does not exist in this server",
          type: "warning",
        });

      // Check if the target is the server owner
      if (targetUser.id === interaction.guild?.ownerId)
        throw new CustomError({
          name: "Can'tMuteOwner",
          message: "Why you would want to mute the owner of this server 🤨",
          type: "warning",
        });

      // Check if the target is the bot itself
      if (targetUser.id === interaction.guild?.members.me?.id)
        throw new CustomError({
          name: "Can'tMuteMe",
          message: "Why you would want to mute me 😭",
          type: "warning",
        });

      // Get role positions for hierarchy check
      await checkUserRolePosition(
        interaction.member!,
        interaction.guild!.members.me!,
        targetUser
      );

      // Parse and validate the duration string
      const msDuration = ms(durationOption as ms.StringValue);
      if (!msDuration)
        throw new CustomError({
          name: "InvalidDuration",
          message: "Please provide a valid duration",
        });

      const strDuration = prettyMs(msDuration);

      // Check if the user is already muted (for logging purposes)
      const userIsMuted = targetUser.isCommunicationDisabled();

      // Apply the timeout (mute) to the user
      await targetUser.timeout(msDuration, reasonOption || undefined);

      // Send a confirmation message
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              iconURL: targetUser.user.displayAvatarURL(),
              name: `|🤫| ${targetUser.user.displayName} has been muted about ${strDuration}`,
            })
            .setDescription(
              `**Reason**: ${reasonOption || "No reason provided"}`
            )
            .setColor("Yellow"),
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
      sendError(interaction, error);

      return false;
    }
  },
  name: "mute",
  description: "Mute a user",
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
