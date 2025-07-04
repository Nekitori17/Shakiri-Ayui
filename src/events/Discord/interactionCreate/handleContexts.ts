import path from "path";
import { Interaction } from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { getLocal } from "../../../helpers/utils/getLocal";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkPermission from "../../../validator/checkPermission";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { CooldownData, isCooledDown, updateCooldown } from "../../../cooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { ContextInterface } from "../../../types/InteractionInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  if (!interaction.isContextMenuCommand()) return;

  try {
    // Get all local context menus
    const localContexts = getLocal<ContextInterface>(
      path.join(__dirname, "../../../contexts")
    );

    // Find the context menu object based on the interaction's command name
    const contextObject = localContexts.find(
      (command) => command.name === interaction.commandName
    );

    if (!contextObject) return;

    // Check if the context menu can be used in DMs
    if (!contextObject.useInDm)
      if (!interaction.guild) {
        return interaction.user.send({
          embeds: [
            CommonEmbedBuilder.error({
              title: "Can't Use In Dm",
              description: "This command can't be used in DMs.",
            }),
          ],
        });
      }

    // Check if the command is for developers only
    if (contextObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This context menu is for developers only.",
          type: "warning",
        });
    }

    let cooldownData: CooldownData | undefined;

    // Check for context menu cooldown
    if (contextObject.cooldown) {
      const cooldownResponse = isCooledDown(
        interaction.commandName,
        "context",
        contextObject.cooldown,
        interaction.user.id
      );

      // If the command is not cooledDown, throw an error
      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this context menu again.`,
          type: "warning",
        });

      cooldownData = cooldownResponse;
    }

    // Check for permissions
    checkPermission(
      interaction.member?.permissions,
      interaction.guild?.members.me?.permissions,
      contextObject.botPermissionsRequired,
      contextObject.userPermissionsRequired
    );

    // Execute the context menu
    const succeed = await contextObject.execute(interaction, client) ?? true;
    if (succeed) updateCooldown(cooldownData);
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Context Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error);
  }
};

export default event;
