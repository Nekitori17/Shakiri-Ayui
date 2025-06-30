/**
 * This file contains the temporary voice menu components.
 */

import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

const tempVoiceSelectMenu = [
  new StringSelectMenuOptionBuilder()
    .setLabel("Rename")
    .setDescription("Change the voice channel's name.")
    .setEmoji("1373929390278443079")
    .setValue("rename"),
  new StringSelectMenuOptionBuilder()
    .setLabel("limit")
    .setDescription("Change the voice channel's user limit.")
    .setEmoji("1373929660596883466")
    .setValue("limit"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Invite")
    .setDescription("Invite users to the voice channel.")
    .setEmoji("1373930817234927658")
    .setValue("invite"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Kick")
    .setDescription("Kick users from the voice channel.")
    .setEmoji("1373930993882370048")
    .setValue("kick"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Block")
    .setDescription("Block users from the voice channel.")
    .setEmoji("1373931203887108098")
    .setValue("block"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Unblock")
    .setDescription("Unblock users from the voice channel.")
    .setEmoji("1373931479595352147")
    .setValue("unblock"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Claim")
    .setDescription("Claim the voice channel ownership.")
    .setEmoji("1373931717055877180")
    .setValue("claim"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Transfer")
    .setDescription("Transfer the voice channel ownership.")
    .setEmoji("1373932539265159188")
    .setValue("transfer"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Region")
    .setDescription("Change the voice channel's region.")
    .setEmoji("1373932679858225263")
    .setValue("region"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Delete")
    .setDescription("Delete the voice channel.")
    .setEmoji("1373932883227443241")
    .setValue("delete"),
];

export default new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("$temp-voice")
    .setPlaceholder("Select an option")
    .addOptions(tempVoiceSelectMenu)
);
