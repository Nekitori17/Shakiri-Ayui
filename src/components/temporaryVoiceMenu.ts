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
    .setLabel("Block")
    .setDescription("Block users from the voice channel.")
    .setEmoji("🚫")
    .setValue("block"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Unblock")
    .setDescription("Unblock users from the voice channel.")
    .setEmoji("✅")
    .setValue("unblock"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Claim")
    .setDescription("Claim the voice channel ownership.")
    .setEmoji("👑")
    .setValue("claim"),
  new StringSelectMenuOptionBuilder()
    .setLabel("Transfer")
    .setDescription("Transfer the voice channel ownership.")
    .setEmoji("🤝")
    .setValue("transfer"),
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
