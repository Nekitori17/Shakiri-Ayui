import path from "path";
import getAllFiles from "./getAllFiles";
import { ContextInterface } from "../types/InteractionInterfaces";

export default (exception: string[] = []) => {
  let localContexts: ContextInterface[] = [];

  const contextCategories = getAllFiles(
    path.join(__dirname, "..", "contexts"),
    true
  );

  for (const contextCategory of contextCategories) {
    const contextFiles = getAllFiles(path.join(contextCategory));

    for (const contextFile of contextFiles) {
      const contextObject = (
        require(contextFile) as { default: ContextInterface }
      ).default;
      if (exception.includes(contextObject.name)) continue;
      localContexts.push(contextObject);
    }
  }

  return localContexts;
};
