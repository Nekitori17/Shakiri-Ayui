import fs from "fs";
import path from "path";

export default <T>(filePath: string, category: string, actionId: string) => {
  const categoryPath = path.join(filePath, toCamelCase(category));
  if (!fs.existsSync(categoryPath)) return;

  const actionList = fs.readdirSync(categoryPath);
  if (
    !actionList.find(
      (action) => actionId == path.basename(action, path.extname(action))
    )
  )
    return;

  return require(path.join(categoryPath, actionId)).default as T;
};

function toCamelCase(str: string) {
  if (!str.includes("-") && !str.includes("_))")) return str.toLowerCase();

  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );
}
