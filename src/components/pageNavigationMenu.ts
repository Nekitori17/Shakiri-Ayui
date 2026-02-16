import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createPageNavigationMenu(page: number, maxPages: number, customId: string) {
  const buttonsPageRow = new ActionRowBuilder<ButtonBuilder>({
    components: [
      new ButtonBuilder()
        .setCustomId(`${customId}-page-prev`)
        .setEmoji("1387296301867073576")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId(`${customId}-page-current`)
        .setLabel(`${page + 1}/${maxPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId(`${customId}-page-next`)
        .setEmoji("1387296195256254564")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= maxPages - 1),
    ],
  });

  return buttonsPageRow;
}
