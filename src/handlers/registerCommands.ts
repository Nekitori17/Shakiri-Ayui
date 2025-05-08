import path from "path";
import { REST, Routes } from "discord.js";
import getLocal from "../helpers/getLocal";
import {
  CommandInterface,
  ContextInterface,
} from "../types/InteractionInterfaces";
import { InteractionRegisterInteraface } from "../types/InteractionRegister";

export default async () => {
  let commands: InteractionRegisterInteraface[] = [];
  const localCommands = getLocal<CommandInterface>(
    path.join(__dirname, "../commands"),
    []
  );
  const localContexts = getLocal<ContextInterface>(
    path.join(__dirname, "../contexts"),
    []
  );

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
      console.log(
        `🗑️ Context ${
          localContext.shortName || localContext.name
        } was set to deleted`
      );
      continue;
    }

    commands.push({
      name: localContext.name,
      type: localContext.type,
      contexts: localContext.contexts || null,
    });
    console.log(
      `➕ Context ${
        localContext.shortName || localContext.name
      } was added to registering`
    );
  }

  const rest = new REST({ version: "10" }).setToken(
    process.env.BOT_TOKEN as string
  );

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
    console.error(`There is an error while trying to register: ${error}`);
  }
};
