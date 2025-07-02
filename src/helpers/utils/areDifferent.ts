import {
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationCommand,
  ApplicationCommandOption,
} from "discord.js";
import {
  CommandInterface,
  CommandOptionChoiceInterface,
  CommandOptionInterface,
  ContextInterface,
} from "../../types/InteractionInterfaces";

/**
 * Determines whether two sets of command option choices are different.
 *
 * @param existingChoices - The array of existing choices, possibly undefined.
 * @param localChoices - The array of local choices to compare against.
 * @returns `true` if the choices are different, otherwise `false`.
 */
function areChoicesDifferent(
  existingChoices: readonly ApplicationCommandOptionChoiceData[] | undefined,
  localChoices: CommandOptionChoiceInterface[]
) {
  // Check if the lengths of the choice arrays are different
  if ((existingChoices?.length || 0) !== localChoices.length) return true;

  // Iterate through each local choice and attempt to find a matching existing choice by name
  for (const localChoice of localChoices) {
    const existingChoice = existingChoices?.find(
      (choice) => choice.name === localChoice.name
    );

    // If a matching existing choice is not found, or the values differ, the choices are considered different
    if (!existingChoice || localChoice.value !== existingChoice.value) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if two arrays of command options are different.
 * @param existingOptions - Options from an existing command.
 * @param localOptions - Options from a local command definition.
 * @returns True if options are different, false otherwise.
 */
const areOptionsDifferent = (
  existingOptions: ApplicationCommandOption[],
  localOptions: CommandOptionInterface[]
): boolean => {
  // If the lengths of the options arrays are different, they are considered different
  if (existingOptions.length !== localOptions.length) return true;

  // If no local options are provided, consider them different
  for (const localOption of localOptions) {
    // Find the existing option that matches the local option by name
    const existingOption = existingOptions?.find(
      (option) => option.name === localOption.name
    );

    // If no matching existing option is found, the options are considered different
    if (!existingOption) {
      return true;
    }

    // Compare the properties of the local option with the existing option
    if (localOption.description !== existingOption.description) {
      return true;
    }

    // Check if the type of the local option matches the existing option
    if (localOption.type !== existingOption.type) {
      return true;
    }

    // Check if the channel types match for channel options
    if (localOption.autocomplete !== existingOption.autocomplete) {
      return true;
    }

    // Check required property for non-subcommand options
    if (
      existingOption.type !== ApplicationCommandOptionType.Subcommand &&
      existingOption.type !== ApplicationCommandOptionType.SubcommandGroup
    ) {
      if ((localOption.required || false) !== existingOption.required) {
        return true;
      }
    }

    // Check choices and autocomplete for options that support them
    if (
      existingOption.type === ApplicationCommandOptionType.String ||
      existingOption.type === ApplicationCommandOptionType.Integer ||
      existingOption.type === ApplicationCommandOptionType.Number
    ) {
      if (!existingOption.autocomplete)
        return areChoicesDifferent(
          existingOption.choices,
          localOption.choices || []
        );
    }
  }

  return false;
};

/**
 * Compares an existing Discord application command with a local command definition
 * to determine if they are different and require an update.
 *
 * @param existingCommand - The command object fetched from Discord.
 * @param localCommand - The local command definition.
 * @returns True if the commands are different, false otherwise.
 */
export default (
  existingCommand: ApplicationCommand,
  localCommand: CommandInterface | ContextInterface
) => {
  // If the existing command is a chat input command, compare its properties with the local chat input command
  if (existingCommand.type === ApplicationCommandType.ChatInput) {
    const chatInputCommand = localCommand as CommandInterface;
    return (
      existingCommand.description !== chatInputCommand.description ||
      areOptionsDifferent(
        existingCommand.options,
        chatInputCommand.options || []
      )
    );
  }

  // If the existing command is a message or user context menu, compare its type with the local context menu
  if (
    existingCommand.type === ApplicationCommandType.Message ||
    existingCommand.type === ApplicationCommandType.User
  ) {
    const contextCommand = localCommand as ContextInterface;
    return existingCommand.type !== contextCommand.type;
  }

  return false;
};
