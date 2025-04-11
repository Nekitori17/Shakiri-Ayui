import fs from "fs";
import path from "path";

export default <T>(filePath: string, category: string, actionId: string) => {
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
