import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const mainMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_prev-track")
    .setEmoji("⏮️")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_pause-or-resume")
    .setEmoji("⏯️")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("$music-controller_stop")
    .setEmoji("⏹️")
    .setStyle(ButtonStyle.Danger),
  new ButtonBuilder()
    .setCustomId("$music-controller_next-track")
    .setEmoji("⏭️")
    .setStyle(ButtonStyle.Secondary),
];

const extendMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_shuffle")
    .setEmoji("🔀")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("$music-controller_loop")
    .setEmoji("🔁")
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId("$music-controller_volume")
    .setEmoji("🔊")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_lyrics")
    .setEmoji("📄")
    .setStyle(ButtonStyle.Secondary),
];

export const mainMusicControllerButtonsRow =
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    mainMusicControllerButtons
  );

export const extendMusicControllerButtonsRow =
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    extendMusicControllerButtons
  );
