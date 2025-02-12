import { EmbedBuilder, GuildMember, User } from "discord.js";

export class ModerationEmbedBuilder {
  public constructor() {}

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
        `**Reason**: ${reason}\n` + 
        duration ? `**Duration**: ${duration}` : ""
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#fffb00")
      .setTimestamp();
  }

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
        `**Reason**: ${reason}\n`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#ff9741")
      .setTimestamp();
  }

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
        `**Reason**: ${reason}\n`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#ff0000")
      .setTimestamp();
  }

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
    update?: boolean
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
        duration ? `**Duration**: ${duration}` : ""
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#e1ff00")
      .setTimestamp();
  }

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
        `**Reason**: ${reason}\n`
      )
      .setThumbnail(target.displayAvatarURL())
      .setColor("#01ff5e")
      .setTimestamp();
  }
}
