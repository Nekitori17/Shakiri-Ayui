import {
  AnySelectMenuInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

/**
 *  * Represents any type of interaction that can occur in Discord.
 * This includes various command interactions, button interactions,
 * select menu interactions, and modal submissions.
 */
export type AnyInteraction =
  | AnySelectMenuInteraction
  | ButtonInteraction
  | ChatInputCommandInteraction
  | CommandInteraction
  | ContextMenuCommandInteraction
  | MessageContextMenuCommandInteraction
  | ModalSubmitInteraction
  | UserContextMenuCommandInteraction;
