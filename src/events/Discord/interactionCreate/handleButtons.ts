import config from "../../../config";
import path from "path";
import { GuildMember, Interaction, PermissionsBitField } from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import isCooledDown from "../../../validator/isCooledDown";
import { getLocalById } from "../../../helpers/utils/getLocal";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { ButtonInterface } from "../../../types/InteractionInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  // Check if the interaction is a button interaction
  if (!interaction.isButton()) return;
  // Check if the customId starts with "$"
  if (!interaction.customId.startsWith("$")) return;

  try {
    // Split the customId to get category and actual customId
    const [category, customId] = interaction.customId.split("_");

    // Get the button object from local files
    const buttonObject = getLocalById<ButtonInterface>(
      path.join(__dirname, "../../../menus/buttons"),
      category.replace("$", ""),
      customId
    );

    if (!buttonObject) return;

    // Check if the button is for developers only
    if (buttonObject.devOnly) {
    }

    // Check if the user is required to be in a voice channel
    if (buttonObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw {
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        };
    }

    // Check for button cooldown
    if (buttonObject.cooldown) {
      const { cooledDown, nextTime } = isCooledDown(
        interaction.customId.slice(1),
        "button",
        buttonObject.cooldown,
        interaction.user.id
      );

      // If the button is not cooledDown, throw an error
      if (!cooledDown && nextTime)
        throw {
          name: "Cooldown",
          message: `Please wait <t:${nextTime}:R> before using this button again.`,
          type: "warning",
        };
    }

    // Add default permissions to botPermissionsRequired if it exists, otherwise initialize it
    if (buttonObject.botPermissionsRequired)
      buttonObject.botPermissionsRequired.push(
        ...config.defaultBotPermissionsRequired
      );
    else
      buttonObject.botPermissionsRequired =
        config.defaultBotPermissionsRequired;

    // Check for bot permissions
    for (const permission of buttonObject.botPermissionsRequired) {
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

    // Check for user permissions
    if (buttonObject.userPermissionsRequired) {
      for (const permission of buttonObject.userPermissionsRequired) {
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

    // Execute the button's action
    buttonObject.execute(interaction, client);
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Button Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error, true);
  }
};

export default event;
