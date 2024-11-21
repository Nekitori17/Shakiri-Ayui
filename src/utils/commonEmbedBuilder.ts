import { EmbedBuilder } from "discord.js";

export default class CommonEmbedBuilder {
  public constructor() {}

  public static info({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }): EmbedBuilder {
    return new EmbedBuilder()
      .setColor("White")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }

  public static success({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }): EmbedBuilder {
    return new EmbedBuilder()
      .setColor("Green")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }

  public static warning({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }): EmbedBuilder {
    return new EmbedBuilder()
      .setColor("Yellow")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }

  public static error({
    title,
    description,
    footer,
  }: {
    title: string;
    description: string;
    footer?: string;
  }): EmbedBuilder {
    return new EmbedBuilder()
      .setColor("Red")
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: footer ?? "Shakiri Ayui" })
      .setTimestamp();
  }
}
