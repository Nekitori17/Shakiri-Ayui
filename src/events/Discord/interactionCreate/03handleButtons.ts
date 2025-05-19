import config from "../../../config";
import path from "path";
import {
  ButtonInteraction,
  GuildMember,
  PermissionsBitField,
} from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { getLocalById } from "../../../helpers/utils/getLocal";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: ButtonInteraction
) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("$")) return;

  try {
    const [category, customId] = interaction.customId.split("_");
    
    const buttonObject = getLocalById<ButtonInterface>(
      path.join(__dirname, "../../../menus/buttons"),
      category.replace("$", ""),
      customId
    );

    if (!buttonObject) return;

    if (buttonObject.voiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw {
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        };
    }

    buttonObject.botPermissions?.push(...config.defaultPermissions);
    if (buttonObject.botPermissions?.length) {
      for (const permission of buttonObject.botPermissions) {
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

    if (buttonObject.permissionsRequired?.length) {
      for (const permission of buttonObject.permissionsRequired) {
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

    buttonObject.execute(interaction, client);
  } catch (error: { name: string; message: string } | any) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Command Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error, true);
  }
};

export default event;
