import _, { get } from "lodash";
import path from "path";
import { getLocal } from "./helpers/utils/getLocal";
import getAllFiles from "./helpers/utils/getAllFiles";
import {
  ButtonInterface,
  CommandInterface,
  ContextInterface,
  SelectMenuInterface,
} from "./types/InteractionInterfaces";

export const commandAliasMap = new Map<string, CommandInterface>();
export const commandMap = new Map<string, CommandInterface>();
export const commandLowerCaseMap = new Map<string, CommandInterface>();
export const contextMap = new Map<string, ContextInterface>();
export const buttonMap = new Map<string, ButtonInterface>();
export const selectMap = new Map<string, SelectMenuInterface>();

/**
 * Preloads interaction components from categorized directories.
 * It iterates through subdirectories (categories) within the given root path,
 * and for each file in those subdirectories, it loads the component and stores it
 * in the provided sourceMap with a key formatted as "categoryName.fileName".
 * @template T - The type of the interaction component (e.g., ButtonInterface, SelectMenuInterface).
 * @param {string} root - The root directory where categories of components are located.
 * @param {Map<string, T>} sourceMap - The Map to store the preloaded components.
 */
function preloadCategoryMap<T>(root: string, sourceMap: Map<string, T>) {
  const categories = getAllFiles(root, true);

  for (const category of categories) {
    const categoryName = path.basename(category);

    const files = getAllFiles(category);

    for (const file of files) {
      const fileName = path.parse(file).name;

      const item = require(file).default as T;

      sourceMap.set(`${categoryName}.${fileName}`, item);
    }
  }
}

/**
 * Loads all commands, contexts, buttons, and select menus from their respective directories into maps for quick access.
 */
export function preload() {
  // Load all command with normal slash command, message command and alias
  const allLocalCommands = getLocal<CommandInterface>(
    path.join(__dirname, "./commands")
  );

  for (const command of allLocalCommands) {
    commandMap.set(command.name, command);

    commandLowerCaseMap.set(
      command.name.replace(/-/gi, "").toLowerCase(), // Convert kebab-case to lowercase
      command
    );

    if (command.alias) {
      commandAliasMap.set(command.alias, command);
    }
  }

  // Load all context menus
  const allLocalContext = getLocal<ContextInterface>(
    path.join(__dirname, "./contexts")
  );

  for (const context of allLocalContext) {
    contextMap.set(context.name, context);
  }

  // Load all buttons
  preloadCategoryMap<ButtonInterface>(
    path.join(__dirname, "./menus/buttons"),
    buttonMap
  );

  // Load all select menu
  preloadCategoryMap<SelectMenuInterface>(
    path.join(__dirname, "./menus/selects"),
    selectMap
  );
}

export function getAliasCommandObject(commandName: string) {
  return commandAliasMap.get(commandName);
}

export function getExactCommandObject(commandName: string) {
  return commandMap.get(commandName);
}

export function getLowerCaseCommandObject(commandName: string) {
  return commandLowerCaseMap.get(commandName);
}

export function getCommandObject(commandName: string) {
  return (
    getAliasCommandObject(commandName) ||
    getLowerCaseCommandObject(commandName) ||
    getExactCommandObject(commandName)
  );
}

export function getContextObject(contextName: string) {
  return contextMap.get(contextName);
}

export function getButtonObject(category: string, buttonName: string) {
  return buttonMap.get(`${category}.${buttonName}`);
}

export function getSelectObject(category: string, selectName: string) {
  return selectMap.get(`${category}.${selectName}`);
}
