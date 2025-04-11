import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

const tempVoiceSelectMenu = [
  new StringSelectMenuOptionBuilder()
    .setLabel("Rename")
    .setDescription("Change the voice channel's name.")
    .setEmoji("📝")
    .setValue("rename"),
  new StringSelectMenuOptionBuilder()
    .setLabel("limit")
    .setDescription("Change the voice channel's user limit.")
    .setEmoji("🔒")
    .setValue("limit"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Invite")
    .setDescription("Invite users to the voice channel.")
    .setEmoji("➕")
    .setValue("invite"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Kick")
    .setDescription("Kick users from the voice channel.")
    .setEmoji("🦵")
    .setValue("kick"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Ban")
    .setDescription("Ban users from the voice channel.")
    .setEmoji("🚫")
    .setValue("ban"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Unban")
    .setDescription("Unban users from the voice channel.")
    .setEmoji("✅")
    .setValue("unban"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Region")
    .setDescription("Change the voice channel's region.")
    .setEmoji("🌐")
    .setValue("region"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Delete")
    .setDescription("Delete the voice channel.")
    .setEmoji("🗑️")
    .setValue("delete"),
];

export default new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("$temp-voice")
    .setPlaceholder("Select an option")
    .addOptions(tempVoiceSelectMenu)
);
