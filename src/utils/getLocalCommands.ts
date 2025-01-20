import path from "path";
import getAllFiles from "../helpers/getAllFiles";
import { CommandInterface } from "../types/InteractionInterfaces";

export default (exception: string[] = []) => {
  let localCommands: CommandInterface[] = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(path.join(commandCategory));

    for (const commandFile of commandFiles) {
      const commandObject = (
        (require(commandFile)) as { default: CommandInterface }
      ).default;
      if (exception.includes(commandObject.name)) continue;
      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
