import {
  Client,
  CommandInteraction,
  GuildMember,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import getLocalCommands from "../../../utils/getLocalCommands";
import CommonEmbedBuilder from "../../../utils/commonEmbedBuilder";
import config from "../../../config";

const event: DiscordEventInterface = async (
  client: Client,
  interaction: CommandInteraction
) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (command) => command.name === interaction.commandName
    );

    if (!commandObject) return;

    if (!commandObject.canUseInDm)
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

    commandObject.botPermissions?.push(...config.setting.defaultPermissions);
    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        if (
          !(interaction.guild?.members.me?.permissions as PermissionsBitField).has(
            permission
          )
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

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
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

    if (commandObject.voiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw {
          name: "No Voice Channel",
          message: "To use this command, you must be in a voice channel",
        };
    }

    commandObject.execute(interaction, client);
  } catch (error: { name: string; message: string } | any) {
    console.log(`\x1b[31m\x1b[1m|> ${error.name} (Command Interaction)\x1b[0m`);
    console.log(`\x1b[32m${error.message}\x1b[0m`);
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
