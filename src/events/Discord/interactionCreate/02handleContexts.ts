import {
  Client,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import getLocalContexts from "../../../utils/getLocalContexts";
import CommonEmbedBuilder from "../../../utils/commonEmbedBuilder";
import config from "../../../config";

const event: DiscordEventInterface = (
  client: Client,
  interaction: any
) => {
  if (!interaction.isContextMenuCommand()) return;

  const localContexts = getLocalContexts();

  try {
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

    contextObject.botPermissions?.push(...config.setting.defaultPermissions);
    if (contextObject.botPermissions?.length) {
      for (const permission of contextObject.botPermissions) {
        if (
          !(
            interaction.guild?.members.me?.permissions as PermissionsBitField
          ).has(permission)
        ) {
          throw {
            name: "Missing Permissions",
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
            name: "Missing Permissions",
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
    console.error(`There was an error executing the command: ${error}`);
    (interaction.channel as TextChannel)?.send({
      embeds: [
        CommonEmbedBuilder.error({
          title: error.name,
          description: error.message,
        }),
      ],
    });
  }
};

export default event;
