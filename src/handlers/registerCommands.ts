import {
  REST,
  Routes,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import getLocalCommands from "../utils/getLocalCommands";
import getLocalContexts from "../utils/getLocalContexts";

export default (): void => {
  interface CommandRegisterInterface {
    name: string;
    description: string;
    options?: {
      name: string;
      description: string;
      type: ApplicationCommandOptionType;
      required: boolean;
      choices?: {
        name: string;
        value: string;
      }[];
    }[];
  }

  interface ContextRegisterInterface {
    name: string;
    type: ApplicationCommandType;
    contexts?: string[] | null;
  }

  let commands: (CommandRegisterInterface | ContextRegisterInterface)[] = [];
  const localCommands = getLocalCommands();
  const localContexts = getLocalContexts();

  for (const localCommand of localCommands) {
    if (localCommand.deleted) {
      console.log(`🗑️ /${localCommand.name} was set to deleted`);
      continue;
    }

    commands.push({
      name: localCommand.name,
      description: localCommand.description,
      options: localCommand?.options,
    });
    console.log(`➕ /${localCommand.name} was added to registering`);
  }

  for (const localContext of localContexts) {
    if (localContext.deleted) {
      console.log(`🗑️ Context ${localContext.shortName || localContext.name} was set to deleted`);
      continue;
    }

    commands.push({
      name: localContext.name,
      type: localContext.type,
      contexts: localContext.contexts || null
    });
    console.log(`➕ Context ${localContext.shortName || localContext.name} was added to registering`);
  }

  const rest = new REST({ version: "10" }).setToken(
    process.env.BOT_TOKEN as string
  );

  (async () => {
    try {
      console.log("📝 Registering everything...");
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID as string),
        {
          body: commands,
        }
      );
      console.log("🎉 Registered successfully!");
    } catch (error) {
      console.error(
        `There is an error while trying to register: ${error}`
      );
    }
  })();
};
