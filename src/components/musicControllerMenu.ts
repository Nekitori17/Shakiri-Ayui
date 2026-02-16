/**
 * This file contains the music controller menu components.
 */

import _ from "lodash";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const basicMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_prev-track")
    .setEmoji("1395107700035293296")
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
    .setEmoji("1395107822924075048")
    .setStyle(ButtonStyle.Secondary),
];

const advancedMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_prev-track")
    .setEmoji("1395107700035293296")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_rewind")
    .setEmoji("1373921791621333035")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_pause-or-resume")
    .setEmoji("1373922027949264966")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("$music-controller_forward")
    .setEmoji("1373921629922394132")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_next-track")
    .setEmoji("1395107822924075048")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_shuffle")
    .setEmoji("1373922415918186536")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_loop")
    .setEmoji("1387283489883164733")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_stop")
    .setEmoji("1373922204890435625")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("$music-controller_volume")
    .setEmoji("1373922918689673276")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_lyrics")
    .setEmoji("1373923100944760892")
    .setStyle(ButtonStyle.Secondary),
];

const extendAdvancedMusicControllerButtons = [
  new ButtonBuilder()
    .setCustomId("$music-controller_queue")
    .setEmoji("1395279468557504583")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_filter")
    .setEmoji("1395099527605649579")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_seek")
    .setEmoji("1395280113716691065")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("$music-controller_clear")
    .setEmoji("1395248491130912788")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("$music-controller_leave")
    .setEmoji("1395280736491274333")
    .setStyle(ButtonStyle.Secondary),
];

export const basicMusicControllerButtonRow =
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    basicMusicControllerButtons
  );

export const advancedMusicControllerButtonRows = _.chunk(
  advancedMusicControllerButtons,
  5
).map((row) => new ActionRowBuilder<ButtonBuilder>().addComponents(row));

export const extendAdvancedMusicControllerButtonRow =
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    extendAdvancedMusicControllerButtons
  );
