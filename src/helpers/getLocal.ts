import getAllFiles from "./getAllFiles";

export default <T>(folderPath: string, exception: string[] = []) => {
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
