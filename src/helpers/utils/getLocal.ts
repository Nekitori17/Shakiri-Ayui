import getAllFiles from "./getAllFiles";

export function getLocal<T>(folderPath: string, exception: string[] = []) {
  let local: T[] = [];

  const categories = getAllFiles(folderPath, true);

  for (const category of categories) {
    const files = getAllFiles(category);

    for (const file of files) {
      const object = require(file).default as T;

      local.push(object);
    }
  }

  return local;
};

import fs from "fs";
import path from "path";

export function getLocalById<T>(filePath: string, category: string, actionId: string) {
  const categoryPath = path.join(filePath, toCamelCase(category));
  if (!fs.existsSync(categoryPath)) return;

  const actionList = fs.readdirSync(categoryPath);
  if (
    !actionList.find(
      (action) => toCamelCase(actionId) == path.basename(action, path.extname(action))
    )
  )
    return;

  return require(path.join(categoryPath, toCamelCase(actionId))).default as T;
};

function toCamelCase(str: string) {
  if (!str.includes("-")) return str.toLowerCase();

  const parts = str.split("-");
  return (
    parts[0].toLowerCase() +
    parts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
}
