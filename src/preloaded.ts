import path from "path";
import { getLocal } from "./helpers/loaders/getLocal";
import getAllFiles from "./helpers/loaders/getAllFiles";
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

function normalizeCommand(name: string) {
  return name.replace(/-/gi, "").toLowerCase();
}

function preloadCategoryMap<T>(root: string, sourceMap: Map<string, T>) {
  const categories = getAllFiles(root, true);

  for (const category of categories) {
    const categoryName = path.basename(category);
    const files = getAllFiles(category);

    for (const file of files) {
      const fileName = path.parse(file).name;
      const key = `${categoryName}.${fileName}`;

      const mod = require(file);
      const item = mod?.default as T;

      if (!item) {
        console.warn(`Invalid module at ${file}`);
        continue;
      }

      if (sourceMap.has(key)) {
        console.warn(`Duplicate key detected: ${key}`);
      }

      sourceMap.set(key, item);
    }
  }
}

export function preload() {
  commandAliasMap.clear();
  commandMap.clear();
  commandLowerCaseMap.clear();
  contextMap.clear();
  buttonMap.clear();
  selectMap.clear();

  const allLocalCommands = getLocal<CommandInterface>(
    path.join(__dirname, "./commands"),
  );

  for (const command of allLocalCommands) {
    commandMap.set(command.name, command);
    commandLowerCaseMap.set(normalizeCommand(command.name), command);

    if (command.alias) {
      for (const alias of command.alias) {
        commandAliasMap.set(normalizeCommand(alias), command);
      }
    }
  }

  const allLocalContext = getLocal<ContextInterface>(
    path.join(__dirname, "./contexts"),
  );

  for (const context of allLocalContext) {
    contextMap.set(context.name, context);
  }

  preloadCategoryMap<ButtonInterface>(
    path.join(__dirname, "./menus/buttons"),
    buttonMap,
  );

  preloadCategoryMap<SelectMenuInterface>(
    path.join(__dirname, "./menus/selects"),
    selectMap,
  );
}

export function getCommandObject(commandName: string) {
  const normalized = normalizeCommand(commandName);

  return (
    commandAliasMap.get(normalized) ||
    commandMap.get(commandName) ||
    commandLowerCaseMap.get(normalized)
  );
}

export function getCommandObjectByName(commandName: string) {
  return commandMap.get(commandName);
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
