import {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  CollectedInteraction,
  CollectedMessageInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  Interaction,
  MentionableSelectMenuInteraction,
  MessageComponentInteraction,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  PrimaryEntryPointCommandInteraction,
  RepliableInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  UserSelectMenuInteraction,
} from "discord.js";

/**
 *  * Represents any type of interaction that can occur in Discord.
 * This includes various command interactions, button interactions,
 * select menu interactions, and modal submissions.
 */
export type AnyInteraction =
  | AnySelectMenuInteraction
  | AutocompleteInteraction
  | ButtonInteraction
  | ChannelSelectMenuInteraction
  | ChatInputCommandInteraction
  | CollectedInteraction
  | CollectedMessageInteraction
  | CommandInteraction
  | ContextMenuCommandInteraction
  | Interaction
  | MentionableSelectMenuInteraction
  | MessageComponentInteraction
  | MessageContextMenuCommandInteraction
  | ModalSubmitInteraction
  | PrimaryEntryPointCommandInteraction
  | RepliableInteraction
  | RoleSelectMenuInteraction
  | StringSelectMenuInteraction
  | UserContextMenuCommandInteraction
  | UserSelectMenuInteraction;
