import path from "path";
import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  ApplicationCommandType,
  Client,
  Collection,
} from "discord.js";
import { getLocal } from "../../../helpers/utils/getLocal";
import areDifferent from "../../../helpers/utils/areDifferent";
import { errorLogger } from "../../../helpers/utils/handleError";
import getApplicationCommands from "../../../helpers/utils/getApplicationCommands";
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

      if (localCommand.deleted) {
        await client.application?.commands.delete(existingCommand);

        console.log(`* 🗑 Deleted /${existingCommand.name} command`);
        registeringStat.deleted++;
        continue;
      }

      if (areDifferent(existingCommand, localCommand)) {
        await client.application?.commands.edit(existingCommand.id, {
          description: description,
          options: options as ApplicationCommandOptionData[],
        });

        registeringStat.edited++;
        console.log(`* 🔁 Edited /${existingCommand.name} command`);
      } else {
        registeringStat.skippedNoChange++;
      }
    } else {
      if (localCommand.deleted) {
        registeringStat.skipped++;
        console.log(
          `* ⏩ Skipping registering command "${name}" as it's set to delete.`
        );
        continue;
      }

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
      if (localContext.deleted) {
        await client.application?.commands.delete(existingContext);

        registeringStat.deleted++;
        console.log(`* 🗑 Deleted |${name}| context menu`);
        continue;
      }

      if (areDifferent(existingContext, localContext)) {
        await client.application?.commands.edit(existingContext.id, {
          name: name,
          type: type,
        });

        registeringStat.edited++;
        console.log(`* 🔁 Edited |${name}| context menu`);
      } else {
        registeringStat.skippedNoChange++;
      }
    } else {
      if (localContext.deleted) {
        registeringStat.skipped++;
        console.log(
          `* ⏩ Skipping registering context menu "${name}" as it's set to delete.`
        );
        continue;
      }

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

  const nonExistentCommands = applicationContexts.filter(
    (cmd) => !localContextExist.includes(cmd)
  );

  for (const command of nonExistentCommands.values()) {
    await client.application?.commands.delete(command);
    registeringStat.deleted++;

    console.log(`* 🗑 Deleted |${command.name}| context menu`);
  }
}
