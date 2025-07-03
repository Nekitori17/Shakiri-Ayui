import config from "../config";
import { PermissionsBitField } from "discord.js";
import { CustomError } from "../helpers/utils/CustomError";

/**
 * Checks if the bot and user have the necessary permissions.
 * Throws an error if any required permissions are missing.
 * @param userPermissionHas The PermissionsBitField of the user.
 * @param botPermissionHas The PermissionsBitField of the bot.
 * @param userPermissionsRequired An array of BigInt representing the permissions required by the user.
 * @param botPermissionsRequired An array of BigInt representing the permissions required by the bot.
 * @throws {object} An error object with `name` and `message` if permissions are missing.
 */
export default function (
  userPermissionHas: string | PermissionsBitField | undefined,
  botPermissionHas: PermissionsBitField | undefined,
  userPermissionsRequired: bigint[] | undefined,
  botPermissionsRequired: bigint[] | undefined
) {
  // Add default bot permissions to the required bot permissions
  botPermissionsRequired = botPermissionsRequired
    ? [...botPermissionsRequired, ...config.defaultBotPermissionsRequired]
    : [...config.defaultBotPermissionsRequired];

  // Filter out the permissions that the bot is missing
  const missingBotPermissions = botPermissionsRequired.filter(
    (perm) =>
      !(botPermissionHas instanceof PermissionsBitField) ||
      !botPermissionHas.has(perm)
  );

  if (missingBotPermissions.length > 0) {
    throw new CustomError({
      name: "MissingPermissions",
      message: `I am missing the following permission(s): \`${new PermissionsBitField(
        missingBotPermissions
      )
        .toArray()
        .join(", ")}\` to use this command.`,
      response: new PermissionsBitField(missingBotPermissions).toArray(),
    });
  }

  // Check if user permissions are required
  if (userPermissionsRequired) {
    const missingUserPermissions = userPermissionsRequired.filter(
      (perm) =>
        !(userPermissionHas instanceof PermissionsBitField) ||
        !userPermissionHas.has(perm)
    );

    if (missingUserPermissions.length > 0)
      throw new CustomError({
        name: "MissingPermissions",
        message: `You are missing the following permission(s): \`${new PermissionsBitField(
          missingUserPermissions
        )
          .toArray()
          .join(", ")}\` to use this command.`,

        response: new PermissionsBitField(missingUserPermissions).toArray(),
      });
  }
}
