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

export type AnyInteraction =
  | AnySelectMenuInteraction
  | ButtonInteraction
  | ChatInputCommandInteraction
  | CommandInteraction
  | ContextMenuCommandInteraction
  | MessageContextMenuCommandInteraction
  | ModalSubmitInteraction
  | UserContextMenuCommandInteraction;
