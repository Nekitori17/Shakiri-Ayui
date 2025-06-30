import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

/**
 * Interface for defining a slash command.
 */
export interface CommandRegisterInterface {
  /** Command name (used when invoking the command) */
  name: string;

  /** Description shown in the command list */
  description: string;

  /** Optional parameters the command accepts */
  options?: {
    /** Option name */
    name: string;

    /** Description of what this option does */
    description: string;

    /** Type of the option
     * @example `ApplicationCommandOptionType.String`
     */
    type: ApplicationCommandOptionType;

    /** Whether this option must be provided */
    required: boolean;

    /** Optional list of predefined choices for the option */
    choices?: {
      /** Display name of the choice */
      name: string;

      /** Value passed to the backend when this choice is selected */
      value: string | number;
    }[];
  }[];
}

/**
 * Interface for registering context menu interactions (User or Message)
 */
export interface ContextRegisterInterface {
  /** Name of the context interaction */
  name: string;

  /** Context type (e.g., user or message) */
  type: ApplicationCommandType;

  /** Optional list of contexts this applies to (nullable) */
  contexts?: string[];
}

/**
 * Union type for all interaction registration types
 */
export type InteractionRegisterInterface =
  | CommandRegisterInterface
  | ContextRegisterInterface;
