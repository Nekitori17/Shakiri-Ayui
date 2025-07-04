import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  MessageContextMenuCommandInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

/**
 * Base structure for all Discord component interactions.
 */
export interface BaseInteractionInterface {
  /** Only available for developers */
  devOnly: boolean;

  /** Cooldown time in seconds (optional) */
  cooldown?: number;

  /** Whether the user must be in a voice channel to use the command */
  requiredVoiceChannel: boolean;

  /** Permissions the user must have to use the command (optional) */
  userPermissionsRequired?: bigint[];

  /** Permissions the bot must have to execute the command (optional) */
  botPermissionsRequired?: bigint[];
}

/**
 * Represents a choice in a command option.
 */
export interface CommandOptionChoiceInterface {
  /** Display name of the choice */
  name: string;

  /** Value associated with the choice */
  value: string | number;
}

/**
 * Represents a single option in a slash command.
 */
export interface CommandOptionInterface {
  /** Name of the option */
  name: string;

  /** Description of the option */
  description: string;

  /** Type of the option (e.g., STRING, INTEGER, etc.) */
  type: ApplicationCommandOptionType;

  /** Whether the option is required */
  required: boolean;

  /** Optional list of predefined choices */
  choices?: CommandOptionChoiceInterface[];

  /** Whether the option supports autocomplete */
  autocomplete?: boolean;
}

/**
 * Interface for a standard slash command.
 */
export interface CommandInterface extends BaseInteractionInterface {
  /**
   * Function to be executed when the command is called.
   * @param interaction - The slash command interaction
   * @param client - The Discord client
   */
  execute: (
    interaction: ChatInputCommandInteraction,
    client: Client
  ) => Promise<boolean | undefined> | boolean;

  /** Optional command alias */
  alias?: string;

  /** Command name */
  name: string;

  /** Command description */
  description: string;

  // /** Function for handling autocomplete interactions (if needed) */
  // autocomplete?: (interaction: AutocompleteInteraction, client: Client) => void;

  /** Whether the command has been deleted or disabled */
  deleted: boolean;

  /** Optional list of options for the command */
  options?: CommandOptionInterface[];

  /** Whether the command can be used in DMs */
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

/**
 * Interface for a context menu command (user or message type).
 */
export interface ContextInterface<
  T extends ApplicationCommandType = ApplicationCommandType
> extends BaseInteractionInterface {
  /**
   * Function to be executed when the context menu item is triggered.
   * @param interaction - The context menu interaction
   * @param client - The Discord client
   */
  execute: (
    interaction: ContextInteractionMap<T>,
    client: Client
  ) => Promise<boolean | undefined> | boolean;

  /** Name of the context menu command */
  name: string;

  /** Type of the command (USER or MESSAGE) */
  type: T;

  /** Optional context scopes where the menu appears */
  contexts?: string[];

  /** Whether the context menu command is deleted or disabled */
  deleted: boolean;

  /** Whether the command can be used in DMs */
  useInDm: boolean;
}

/**
 * Interface for a custom button interaction.
 */
export interface ButtonInterface extends BaseInteractionInterface {
  /**
   * Function to execute when the button is clicked.
   * @param interaction - The button interaction
   * @param client - The Discord client
   */
  execute: (
    interaction: ButtonInteraction,
    client: Client
  ) => Promise<boolean | undefined> | boolean;

  /** Whether the button is currently disabled */
  disabled: boolean;
}

/**
 * Interface for a custom select menu interaction.
 */
export interface SelectMenuInterface extends BaseInteractionInterface {
  /**
   * Function to execute when a select menu item is selected.
   * @param interaction - The select menu interaction
   * @param client - The Discord client
   */
  execute: (
    interaction: StringSelectMenuInteraction,
    client: Client
  ) => Promise<boolean | undefined> | boolean;

  /** Whether the select menu is currently disabled */
  disabled: boolean;
}
