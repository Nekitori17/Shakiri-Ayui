import getAllFiles from "./getAllFiles";
import fs from "fs";
import path from "path";
import _ from "lodash";

/**
 * Dynamically imports and returns all default exports from files
 * located in a directory and its subdirectories.
 *
 * Common use cases: loading all commands, events, or modules at runtime.
 *
 * @param folderPath - The root directory path to scan for files.
 * @param exception - (Optional) A list of paths to exclude (currently unused).
 * @returns An array of imported default exports as type T.
 */
export function getLocal<T>(folderPath: string, exception: string[] = []) {
  // Retrieve all subdirectories (categories) from the root folder
  const categories = getAllFiles(folderPath, true);

  // For each category folder, get all files,
  // then require and cast each module's default export to type T
  const local = _(categories)
    .flatMap((category) => getAllFiles(category)) // flatten all files from all categories into one array
    .map((file) => require(file).default as T)    // import the module using require
    .value();

  return local;
}

/**
 * Dynamically imports a single file from a specific category based on a given ID.
 *
 * Common use case: loading a specific action/command by ID at runtime.
 *
 * @param filePath - Base path where categories are located.
 * @param category - The folder name (converted to camelCase) under the base path.
 * @param actionId - The file name (without extension), also matched in camelCase.
 * @returns The imported module's default export as type T, or undefined if not found.
 */
export function getLocalById<T>(
  filePath: string,
  category: string,
  actionId: string
) {
  // Construct full path to the category folder
  const categoryPath = path.join(filePath, _.camelCase(category));

  // Return undefined if the category folder doesn't exist
  if (!fs.existsSync(categoryPath)) return;

  // Read the list of files inside the category folder
  const actionList = fs.readdirSync(categoryPath);

  // Find a file whose name (without extension) matches the camelCase actionId
  const found = _.find(actionList, (action) => {
    return (
      _.camelCase(actionId) === path.basename(action, path.extname(action))
    );
  });

  // Return undefined if no matching file found
  if (!found) return;

  // Import and return the module's default export with proper typing
  return require(path.join(categoryPath, _.camelCase(actionId))).default as T;
}
