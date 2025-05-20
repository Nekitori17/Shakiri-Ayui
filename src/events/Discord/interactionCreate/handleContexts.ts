import config from "../../../config";
import path from "path";
import { PermissionsBitField } from "discord.js";
import { getLocal } from "../../../helpers/utils/getLocal";
import sendError from "../../../helpers/utils/sendError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { ContextInterface } from "../../../types/InteractionInterfaces";
import isCooldowned from "../../../validator/isCooldowned";

const event: DiscordEventInterface = (client, interaction: any) => {
  if (!interaction.isContextMenuCommand()) return;

  try {
    const localContexts = getLocal<ContextInterface>(
      path.join(__dirname, "../../../contexts")
    );

    const contextObject = localContexts.find(
      (command) => command.name === interaction.commandName
    );

    if (!contextObject) return;

    if (!contextObject.canUseInDm)
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

    if (contextObject.cooldown) {
      const { cooldowned, nextTime } = isCooldowned(
        interaction.commandName,
        "command",
        contextObject.cooldown,
        interaction.user.id
      );

      if (!cooldowned && nextTime)
        throw {
          name: "Cooldown",
          message: `Please wait <t:${nextTime}:R> before using this context menu again.`,
          type: "warning",
        };
    }

    contextObject.botPermissions?.push(...config.defaultPermissions);
    if (contextObject.botPermissions?.length) {
      for (const permission of contextObject.botPermissions) {
        if (
          !(
            interaction.guild?.members.me?.permissions as PermissionsBitField
          ).has(permission)
        ) {
          throw {
            name: "MissingPermissions",
            message: `I'am missing the \`${new PermissionsBitField(permission)
              .toArray()
              .join(", ")}\` permission to use this command.`,
          };
        }
      }
    }

    if (contextObject.permissionsRequired?.length) {
      for (const permission of contextObject.permissionsRequired) {
        if (
          !(interaction.member?.permissions as PermissionsBitField).has(
            permission
          )
        )
          throw {
            name: "MissingPermissions",
            message: `You are missing the \`${new PermissionsBitField(
              permission
            )
              .toArray()
              .join(", ")}\` permission to use this command.`,
          };
      }
    }

    contextObject.execute(interaction, client);
  } catch (error: { name: string; message: string } | any) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Command Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error);
  }
};

export default event;
