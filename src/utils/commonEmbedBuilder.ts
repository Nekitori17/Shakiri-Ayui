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
    .setAuthor({
      name: "Success",
      iconURL: "https://img.icons8.com/color/512/ok--v1.png"
    })
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
    .setAuthor({
      name: "Warning",
      iconURL: "https://img.icons8.com/emoji/512/warning-emoji.png"
    })
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
