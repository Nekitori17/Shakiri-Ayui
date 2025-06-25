import getAllFiles from "./getAllFiles";
import fs from "fs";
import path from "path";
import _ from "lodash";

export function getLocal<T>(folderPath: string, exception: string[] = []) {
  const categories = getAllFiles(folderPath, true);

  const local = _(categories)
    .flatMap((category) => getAllFiles(category))
    .map((file) => require(file).default as T)
    .value();

  return local;
}

export function getLocalById<T>(
  filePath: string,
  category: string,
  actionId: string
) {
  const categoryPath = path.join(filePath, _.camelCase(category));
  if (!fs.existsSync(categoryPath)) return;

  const actionList = fs.readdirSync(categoryPath);
  const found = _.find(actionList, (action) => {
    return (
      _.camelCase(actionId) === path.basename(action, path.extname(action))
    );
  });

  if (!found) return;

  return require(path.join(categoryPath, _.camelCase(actionId))).default as T;
}
