import path from "path";
import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  ApplicationCommandType,
  Client,
  Collection,
} from "discord.js";
import { getLocal } from "../../../helpers/loaders/getLocal";
import areDifferent from "../../../helpers/common/areDifferent";
import { errorLogger } from "../../../helpers/errors/handleError";
import getApplicationCommands from "../../../helpers/loaders/getApplicationCommands";
import {
  CommandInterface,
  ContextInterface,
} from "../../../types/InteractionInterfaces";

interface RegisterStat {
  registered: number;
  edited: number;
  deleted: number;
  skipped: number;
  skippedNoChange: number;
}

const registeringStat: RegisterStat = {
  registered: 0,
  edited: 0,
  deleted: 0,
  skipped: 0,
  skippedNoChange: 0,
};

export default async (client: Client) => {
  try {
    const applicationCommands = await getApplicationCommands(client);

    const applicationChatInputCommands = applicationCommands?.filter(
      (cmd) => cmd.type === ApplicationCommandType.ChatInput
    );
    const localCommands = getLocal<CommandInterface>(
      path.join(__dirname, "../../../commands")
    );

    // Register or update ChatInput commands
    await registerChatInputCommands(
      client,
      applicationChatInputCommands,
      localCommands
    );

    const applicationContextMenuCommands = applicationCommands?.filter(
      (cmd) =>
        cmd.type === ApplicationCommandType.Message ||
        cmd.type === ApplicationCommandType.User
    );
    const localContexts = getLocal<ContextInterface>(
      path.join(__dirname, "../../../contexts")
    );

    // Register or update Context Menu commands
    await registerContexts(
      client,
      applicationContextMenuCommands,
      localContexts
    );

    console.log(
      `=======================================` +
        "\n" +
        `# 🎉 Command Registration Report` +
        "\n" +
        `> 🆕 Registered: ${registeringStat.registered} ` +
        "\n" +
        `> ✏ Edited: ${registeringStat.edited} ` +
        "\n" +
        `> ❌ Deleted: ${registeringStat.deleted} ` +
        "\n" +
        `> ⏭ Skipped: ${registeringStat.skipped} ` +
        "\n" +
        `> ✔ Skipped (No Change): ${registeringStat.skippedNoChange}` +
        "\n" +
        `=======================================`
    );
  } catch (error) {
    errorLogger(error)
  }
};

async function registerChatInputCommands(
  client: Client,
  applicationChatInputCommands:
    | Collection<string, ApplicationCommand>
    | undefined,
  localChatInputCommands: CommandInterface[]
) {
  if (!applicationChatInputCommands) return;

  let localChatInputCommandExist: ApplicationCommand[] = [];

  for (const localCommand of localChatInputCommands) {
    const { name, description, options } = localCommand;

    const existingCommand = applicationChatInputCommands.find(
      (cmd) => cmd.name === name
    );

    if (existingCommand) {
      localChatInputCommandExist.push(existingCommand);

      // If the local command is marked as deleted, remove it from Discord
      if (localCommand.deleted) {
        await client.application?.commands.delete(existingCommand);
        console.log(`* 🗑 Deleted /${existingCommand.name} command`);
        registeringStat.deleted++;
        continue;
      }

      // Compare existing command with local definition and edit if different
      if (areDifferent(existingCommand, localCommand)) {
        await client.application?.commands.edit(existingCommand.id, {
          description: description,
          options: options as ApplicationCommandOptionData[],
        });

        registeringStat.edited++;
        console.log(`* 🔁 Edited /${existingCommand.name} command`);
      } else {
        // No change needed
        registeringStat.skippedNoChange++;
      }
    } else {
      // If the command doesn't exist and is marked deleted, skip registration
      if (localCommand.deleted) {
        registeringStat.skipped++;
        console.log(
          `* ⏩ Skipping registering command "${name}" as it's set to delete.`
        );
        continue;
      }

      // Create new command on Discord
      const newChatInputCommand = await client.application?.commands.create({
        name: name,
        description: description,
        type: ApplicationCommandType.ChatInput,
        options: options as ApplicationCommandOptionData[],
      });

      if (newChatInputCommand)
        localChatInputCommandExist.push(newChatInputCommand);

      registeringStat.registered++;
      console.log(`* ➕ Registered /${name} command`);
    }
  }

  // Delete commands that exist on Discord but not in local commands
  const nonExistentCommands = applicationChatInputCommands.filter(
    (cmd) => !localChatInputCommandExist.includes(cmd)
  );

  for (const command of nonExistentCommands.values()) {
    await client.application?.commands.delete(command);
    registeringStat.deleted++;
    console.log(`* 🗑 Deleted /${command.name} command`);
  }
}

async function registerContexts(
  client: Client,
  applicationContexts: Collection<string, ApplicationCommand> | undefined,
  localContextMenuCommands: ContextInterface[]
) {
  if (!applicationContexts) return;

  let localContextExist: ApplicationCommand[] = [];

  for (const localContext of localContextMenuCommands) {
    const { name, type } = localContext;

    const existingContext = applicationContexts.find(
      (cmd) => cmd.name === name
    );

    if (existingContext) {
      localContextExist.push(existingContext);

      // If local context is marked deleted, remove it
      if (localContext.deleted) {
        await client.application?.commands.delete(existingContext);
        registeringStat.deleted++;
        console.log(`* 🗑 Deleted |${name}| context menu`);
        continue;
      }

      // Compare existing context with local and update if necessary
      if (areDifferent(existingContext, localContext)) {
        await client.application?.commands.edit(existingContext.id, {
          name: name,
          type: type,
        });

        registeringStat.edited++;
        console.log(`* 🔁 Edited |${name}| context menu`);
      } else {
        // No changes needed
        registeringStat.skippedNoChange++;
      }
    } else {
      // Skip registration if context is marked deleted locally
      if (localContext.deleted) {
        registeringStat.skipped++;
        console.log(
          `* ⏩ Skipping registering context menu "${name}" as it's set to delete.`
        );
        continue;
      }

      // Create new context menu command
      const newContext = await client.application?.commands.create({
        name: name,
        description: "",
        type: type,
      });

      if (newContext) localContextExist.push(newContext);
      registeringStat.registered++;
      console.log(`* ➕ Registered |${name}| context menu`);
    }
  }

  // Delete any context menu commands that are not present locally
  const nonExistentCommands = applicationContexts.filter(
    (cmd) => !localContextExist.includes(cmd)
  );

  for (const command of nonExistentCommands.values()) {
    await client.application?.commands.delete(command);
    registeringStat.deleted++;
    console.log(`* 🗑 Deleted |${command.name}| context menu`);
  }
}
