import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  MessageContextMenuCommandInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

/**
 * Base interface shared across all Discord interaction types.
 */
export interface BaseInteractionInterface {
  devOnly: boolean;
  cooldown?: number;
  requiredVoiceChannel: boolean;
  userPermissionsRequired?: bigint[];
  botPermissionsRequired?: bigint[];
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
  execute: (interaction: ChatInputCommandInteraction, client: Client) => void;
  alias?: string;
  name: string;
  description: string;
  deleted: boolean;
  options?: CommandOptionInterface[];
  useInDm: boolean;
}

/**
 * Conditional type mapping ApplicationCommandType to interaction type
 */
type ContextInteractionMap<T extends ApplicationCommandType> =
  T extends ApplicationCommandType.User
    ? UserContextMenuCommandInteraction
    : T extends ApplicationCommandType.Message
    ? MessageContextMenuCommandInteraction
    : never;

/**
 * Generic context menu interface with type-based interaction
 */
export interface ContextInterface<
  T extends ApplicationCommandType = ApplicationCommandType
> extends BaseInteractionInterface {
  execute: (interaction: ContextInteractionMap<T>, client: Client) => void;
  name: string;
  type: T;
  contexts?: string[];
  deleted: boolean;
  useInDm: boolean;
}

export interface ButtonInterface extends BaseInteractionInterface {
  execute: (interaction: ButtonInteraction, client: Client) => void;
  disabled: boolean;
}

export interface SelectMenuInterface extends BaseInteractionInterface {
  execute: (interaction: StringSelectMenuInteraction, client: Client) => void;
  disabled: boolean;
}
