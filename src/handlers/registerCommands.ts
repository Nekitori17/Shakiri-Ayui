import path from "path";
import { REST, Routes } from "discord.js";
import { getLocal } from "../helpers/utils/getLocal";
import {
  CommandInterface,
  ContextInterface,
} from "../types/InteractionInterfaces";
import { InteractionRegisterInterface } from "../types/InteractionRegister";

// TODO: Upgrade this to registering when have change
export default async () => {
  let registeringStuffs: InteractionRegisterInterface[] = [];
  
  // Get all local commands
  const localCommands = getLocal<CommandInterface>(
    path.join(__dirname, "../commands"),
    []
  );

  // Loop through each local command and add it to the registering array
  for (const localCommand of localCommands) {
    // If the command is marked for deletion, skip it
    if (localCommand.deleted) {
      console.log(`🗑️ /${localCommand.name} was set to deleted`);
      continue;
    }

    // Add the command to the array for registration
    registeringStuffs.push({
      name: localCommand.name,
      description: localCommand.description,
      options: localCommand?.options,
    });
    console.log(`➕ /${localCommand.name} was added to registering`);
  }

  // Get all local contexts
  const localContexts = getLocal<ContextInterface>(
    path.join(__dirname, "../contexts"),
    []
  );

  // Loop through each local context and add it to the registering array
  for (const localContext of localContexts) {
    // If the context is marked for deletion, skip it
    if (localContext.deleted) {
      console.log(
        `🗑️ Context ${
          localContext.shortName || localContext.name
        } was set to deleted`
      );
      continue;
    }

    // Add the context to the array for registration
    registeringStuffs.push({
      name: localContext.name,
      type: localContext.type,
      contexts: localContext.contexts,
    });
    console.log(
      `➕ Context ${
        localContext.shortName || localContext.name
      } was added to registering`
    );
  }

  // Initialize REST client for Discord API
  const rest = new REST({ version: "10" }).setToken(
    process.env.BOT_TOKEN as string
  );

  // Register commands and contexts with Discord
  try {
    console.log("📝 Registering everything...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      {
        body: registeringStuffs,
      }
    );
    console.log("🎉 Registered successfully!");
  } catch (error) {
    console.error(`There is an error while trying to register: ${error}`);
  }
};
