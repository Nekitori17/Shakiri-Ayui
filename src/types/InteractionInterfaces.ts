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
  /** Whether the command is restricted to developers only */
  devOnly: boolean;

  /** Cooldown time in seconds between uses (optional) */
  cooldown?: number;

  /** Whether the user is required to be in a voice channel */
  requiredVoiceChannel: boolean;

  /** Required permissions for the user (optional) */
  userPermissionsRequired?: bigint[];

  /** Required permissions for the bot (optional) */
  botPermissionsRequired?: bigint[];
}

/**
 * Defines a single option for a slash command.
 */
export interface CommandOptionInterface {
  /** The name of the option */
  name: string;

  /** Description of what the option does */
  description: string;

  /** The type of the option (from ApplicationCommandOptionType enum) */
  type: ApplicationCommandOptionType;

  /** Whether the option is required */
  required: boolean;

  /** Optional list of preset choices for the option */
  choices?: {
    /** Display name of the choice */
    name: string;

    /** Value of the choice (can be string or number) */
    value: string | number;
  }[];
}

/**
 * Interface for a slash command (ChatInput).
 */
export interface CommandInterface extends BaseInteractionInterface {
  /**
   * Function executed when the slash command is triggered.
   * @param interaction - The interaction object from Discord
   * @param client - The Discord bot client
   */
  execute: (interaction: ChatInputCommandInteraction, client: Client) => void;

  /** Optional alias for the command (e.g., short form like 'p' for 'play') */
  alias?: string;

  /** Command name */
  name: string;

  /** Description of the command */
  description: string;

  /** Marks the command as deleted or disabled */
  deleted: boolean;

  /** Optional static options for the command */
  options?: CommandOptionInterface[];

  /**
   * Optional dynamic options generator based on interaction context.
   * @param interaction - The interaction object
   * @param client - The Discord bot client
   * @returns Array of command options
   */
  dynamicOptions?: (
    interaction: ChatInputCommandInteraction,
    client: Client
  ) => CommandOptionInterface[];

  /** Whether the command can be used in direct messages */
  useInDm: boolean;
}

/**
 * Interface for context menu commands (user or message).
 */
export interface ContextInterface extends BaseInteractionInterface {
  /**
   * Function executed when the context menu is triggered.
   * @param interaction - The interaction object (user or message context)
   * @param client - The Discord bot client
   */
  execute: (
    interaction:
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction,
    client: Client
  ) => void;

  /** Name of the context command */
  name: string;

  /** A short internal name for the context command */
  shortName: string;

  /** The type of context menu command (user or message) */
  type: ApplicationCommandType;

  /** Optional applicable context types (e.g., message, user) */
  contexts?: string[];

  /** Marks the context command as deleted */
  deleted: boolean;

  /** Whether it can be used in direct messages */
  useInDm: boolean;
}

/**
 * Interface for button interactions.
 */
export interface ButtonInterface extends BaseInteractionInterface {
  /**
   * Function executed when the button is clicked.
   * @param interaction - The button interaction object
   * @param client - The Discord bot client
   */
  execute: (interaction: ButtonInteraction, client: Client) => void;

  /** Whether the button is currently disabled */
  disabled: boolean;
}

/**
 * Interface for string select menu interactions.
 */
export interface SelectMenuInterface extends BaseInteractionInterface {
  /**
   * Function executed when an option is selected in the menu.
   * @param interaction - The select menu interaction object
   * @param client - The Discord bot client
   */
  execute: (interaction: StringSelectMenuInteraction, client: Client) => void;

  /** Whether the select menu is currently disabled */
  disabled: boolean;
}
