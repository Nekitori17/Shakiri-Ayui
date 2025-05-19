import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const mainMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_prev-track")
    .setEmoji("1373921791621333035")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_pause-or-resume")
    .setEmoji("1373922027949264966")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_stop")
    .setEmoji("1373922204890435625")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_next-track")
    .setEmoji("1373921629922394132")
    .setStyle(ButtonStyle.Secondary),
];

const extendMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_shuffle")
    .setEmoji("1373922415918186536")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_loop")
    .setEmoji("1373922576459366420")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_volume")
    .setEmoji("1373922918689673276")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_lyrics")
    .setEmoji("1373923100944760892")
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
