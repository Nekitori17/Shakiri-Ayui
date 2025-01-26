import getAllFiles from "./getAllFiles";

export default <T>(
  folderPath: string,
  exception: string[] = [],
  exceptionField?: keyof T
) => {
  let local: T[] = [];

  const categories = getAllFiles(folderPath, true);

  for (const category of categories) {
    const files = getAllFiles(category);

    for (const file of files) {
      const object = require(file).default as T;

      if (exceptionField) {
        const fieldValue = String(object[exceptionField]);
        if (exception.includes(fieldValue)) continue;
      }

      local.push(object);
    }
  }

  return local;
};
