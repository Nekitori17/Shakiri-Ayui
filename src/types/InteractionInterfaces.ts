import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  PermissionResolvable,
} from "discord.js";
import ExtendedClient from "../classes/ExtendedClient";

export interface BaseInteractionInterface {
  disabled: boolean;
  devOnly: boolean;
  cooldown?: number;
  requiredVoiceChannel: boolean;
  userPermissionsRequired?: PermissionResolvable[];
  botPermissionsRequired?: PermissionResolvable[];
}
export interface CommandOptionChoiceInterface {
  name: string;
  value: string | number;
}

export interface CommandOptionInterface {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required: boolean;
  choices?: CommandOptionChoiceInterface[];
  autocomplete?: boolean;
}

export interface CommandInterface extends BaseInteractionInterface {
  execute: (
    interaction: ChatInputCommandInteraction,
    client: ExtendedClient,
  ) => Promise<boolean | undefined> | boolean;

  alias?: string[];
  name: string;
  description: string;

  // autocomplete?: (interaction: AutocompleteInteraction, client: Client) => void;

  deleted: boolean;
  options?: CommandOptionInterface[];
  useInDm: boolean;
}

/**
 * Maps an ApplicationCommandType to its corresponding interaction type.
 */
type ContextInteractionMap<T extends ApplicationCommandType> =
  T extends ApplicationCommandType.User
    ? UserContextMenuCommandInteraction
    : T extends ApplicationCommandType.Message
      ? MessageContextMenuCommandInteraction
      : never;

export interface ContextInterface<
  T extends ApplicationCommandType = ApplicationCommandType,
> extends BaseInteractionInterface {
  execute: (
    interaction: ContextInteractionMap<T>,
    client: ExtendedClient,
  ) => Promise<boolean | undefined> | boolean;

  name: string;
  type: T;
  deleted: boolean;
  useInDm: boolean;
}

export interface ButtonInterface extends BaseInteractionInterface {
  execute: (
    interaction: ButtonInteraction,
    client: ExtendedClient,
  ) => Promise<boolean | undefined> | boolean;
}

export interface SelectMenuInterface extends BaseInteractionInterface {
  execute: (
    interaction: StringSelectMenuInteraction,
    client: ExtendedClient,
  ) => Promise<boolean | undefined> | boolean;
}
