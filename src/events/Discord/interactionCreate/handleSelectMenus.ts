import config from "../../../config";
import path from "path";
import { GuildMember, PermissionsBitField, Interaction } from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import isCooledDown from "../../../validator/isCooledDown";
import { getLocalById } from "../../../helpers/utils/getLocal";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  // Check if the interaction is a string select menu
  if (!interaction.isStringSelectMenu()) return;
  // Check if the customId starts with "$"
  if (!interaction.customId.startsWith("$")) return;

  try {
    // Get the select menu option object from local files
    const selectMenuOptionObject = getLocalById<SelectMenuInterface>(
      path.join(__dirname, "../../../menus/selects"),
      interaction.customId.replace("$", ""),
      interaction.values[0]
    );

    if (!selectMenuOptionObject) return;
    // Edit the message components to prevent re-selection issues
    await interaction.message.edit({
      components: interaction.message.components,
    });

    // TODO: If select menu only allow dev to use. let check it
    // Check if the select menu is for developers only
    if (selectMenuOptionObject.devOnly) {
    }

    if (selectMenuOptionObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw {
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        };
    }

    // Check for select menu cooldown
    if (selectMenuOptionObject.cooldown) {
      const { cooledDown, nextTime } = isCooledDown(
        interaction.customId.slice(1),
        "button",
        selectMenuOptionObject.cooldown,
        interaction.user.id
      );

      // If the select menu is not cooledDown, throw an error
      if (!cooledDown && nextTime)
        throw {
          name: "Cooldown",
          message: `Please wait <t:${nextTime}:R> before using this select menu again.`,
          type: "warning",
        };
    }

    // Add default permissions to botPermissionsRequired if it exists, otherwise initialize it
    if (selectMenuOptionObject.botPermissionsRequired)
      selectMenuOptionObject.botPermissionsRequired.push(
        ...config.defaultBotPermissionsRequired
      );
    else
      selectMenuOptionObject.botPermissionsRequired =
        config.defaultBotPermissionsRequired;

    // Check for bot permissions
    for (const permission of selectMenuOptionObject.botPermissionsRequired) {
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
    if (selectMenuOptionObject.userPermissionsRequired) {
      for (const permission of selectMenuOptionObject.userPermissionsRequired) {
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

    // Execute the select menu's action
    selectMenuOptionObject.execute(interaction, client);
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Select Menu Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error, true);
  }
};

export default event;
