import { EmbedBuilder } from "discord.js";

/**
 * Utility class to quickly generate standardized EmbedBuilder instances
 * for common use cases like info, success, warning, and error messages.
 */
export default class CommonEmbedBuilder {
  public constructor() {}

  /**
   * Generates an information embed with a white color theme and info icon.
   * @param title - The title of the embed.
   * @param description - The main content of the embed.
   * @param footer - Optional footer text (default: "Shakiri Ayui").
   * @returns A styled EmbedBuilder instance.
   */
  public static info({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: "Info",
        iconURL: "https://img.icons8.com/color/512/info.png",
      })
      .setColor("White")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }

  /**
   * Generates a success embed with a green color theme and success icon.
   * @param title - The title of the embed.
   * @param description - The main content of the embed.
   * @param footer - Optional footer text (default: "Shakiri Ayui").
   * @returns A styled EmbedBuilder instance.
   */
  public static success({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: "Success",
        iconURL: "https://img.icons8.com/color/512/ok--v1.png",
      })
      .setColor("Green")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }

  /**
   * Generates a warning embed with a yellow color theme and warning icon.
   * @param title - The title of the embed.
   * @param description - The main content of the embed.
   * @param footer - Optional footer text (default: "Shakiri Ayui").
   * @returns A styled EmbedBuilder instance.
   */
  public static warning({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: "Warning",
        iconURL: "https://img.icons8.com/emoji/512/warning-emoji.png",
      })
      .setColor("Yellow")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }

  /**
   * Generates an error embed with a red color theme and error icon.
   * @param title - The title of the embed.
   * @param description - The main content of the embed.
   * @param footer - Optional footer text (default: "Shakiri Ayui").
   * @returns A styled EmbedBuilder instance.
   */
  public static error({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }) {
    return new EmbedBuilder()
      .setAuthor({
        name: "Error",
        iconURL: "https://img.icons8.com/flat-round/512/error--v1.png",
      })
      .setColor("Red")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }
}
