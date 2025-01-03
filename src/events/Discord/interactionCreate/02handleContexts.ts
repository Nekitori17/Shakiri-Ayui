import config from "../../../config";
import { PermissionsBitField, TextChannel } from "discord.js";
import getLocalContexts from "../../../utils/getLocalContexts";
import CommonEmbedBuilder from "../../../utils/commonEmbedBuilder";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = (client, interaction: any) => {
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

    contextObject.botPermissions?.push(...config.defaultPermissions);
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
    console.log(`\x1b[31m\x1b[1m|> ${error.name} (Context Interaction)\x1b[0m`);
    console.log(`\x1b[32m${error.message}\x1b[0m`);
    console.log(error);

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
