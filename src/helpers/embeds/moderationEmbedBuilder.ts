import { EmbedBuilder, GuildMember, User } from "discord.js";

/**
 * A utility class for generating embeds related to moderation actions.
 * Each method provides a standardized embed for a specific moderation event.
 */
export class ModerationEmbedBuilder {
  public constructor() {}

  /**
   * Creates a warning embed.
   * @param target - The user being warned.
   * @param moderator - The moderator who issued the warning.
   * @param reason - Reason for the warning.
   * @param duration - Optional duration (for temporary warnings).
   */
  public static warn({
    target,
    moderator,
    reason,
    duration,
  }: {
    target: GuildMember;
    moderator: User;
    reason: string;
    duration?: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: `Request by: ${moderator.displayName}`,
        iconURL: moderator.displayAvatarURL(),
      })
      .setTitle("Warn")
      .setDescription(
        `**Target**: ${target}\n` +
        `**Reason**: ${reason}` +
        (duration ? `\n**Duration**: ${duration}` : "")
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#fffb00")
      .setTimestamp();
  }

  /**
   * Creates a kick embed.
   * @param target - The user being kicked.
   * @param moderator - The moderator who issued the kick.
   * @param reason - Reason for the kick.
   */
  public static kick({
    target,
    moderator,
    reason,
  }: {
    target: GuildMember;
    moderator: User;
    reason: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: `Request by: ${moderator.displayName}`,
        iconURL: moderator.displayAvatarURL(),
      })
      .setTitle("Kick")
      .setDescription(
        `**Target**: ${target}\n` +
        `**Reason**: ${reason}`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#ff9741")
      .setTimestamp();
  }

  /**
   * Creates a ban embed.
   * @param target - The user being banned.
   * @param moderator - The moderator who issued the ban.
   * @param reason - Reason for the ban.
   */
  public static ban({
    target,
    moderator,
    reason,
  }: {
    target: GuildMember;
    moderator: User;
    reason: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: `Request by: ${moderator.displayName}`,
        iconURL: moderator.displayAvatarURL(),
      })
      .setTitle("Ban")
      .setDescription(
        `**Target**: ${target}\n` +
        `**Reason**: ${reason}`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#ff0000")
      .setTimestamp();
  }

  /**
   * Creates a mute or update-mute embed.
   * @param target - The user being muted.
   * @param moderator - The moderator who issued the mute.
   * @param reason - Reason for the mute.
   * @param duration - Duration of the mute.
   * @param update - Whether this is an update to an existing mute.
   */
  public static mute({
    target,
    moderator,
    reason,
    duration,
    update
  }: {
    target: GuildMember;
    moderator: User;
    reason: string;
    duration: string;
    update?: boolean;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: `Request by: ${moderator.displayName}`,
        iconURL: moderator.displayAvatarURL(),
      })
      .setTitle(update ? "Update Mute" : "Mute")
      .setDescription(
        `**Target**: ${target}\n` +
        `**Reason**: ${reason}\n` +
        `**Duration**: ${duration}`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#e1ff00")
      .setTimestamp();
  }

  /**
   * Creates an un-action embed (unban, unmute, unwarn).
   * @param action - The type of undo moderation action.
   * @param target - The user affected by the action.
   * @param moderator - The moderator who performed the action.
   * @param reason - Reason for the un-action.
   */
  public static un({
    action,
    target,
    moderator,
    reason,
  }: {
    action: "Unmute" | "Unban" | "Unwarn";
    target: GuildMember;
    moderator: User;
    reason: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: `Request by: ${moderator.displayName}`,
        iconURL: moderator.displayAvatarURL(),
      })
      .setTitle(action)
      .setDescription(
        `**Target**: ${target}\n` +
        `**Reason**: ${reason}`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#01ff5e")
      .setTimestamp();
  }
}
