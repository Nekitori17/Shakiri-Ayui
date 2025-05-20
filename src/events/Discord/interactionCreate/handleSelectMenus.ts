import config from "../../../config";
import path from "path";
import {
  GuildMember,
  PermissionsBitField,
  StringSelectMenuInteraction,
} from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { getLocalById } from "../../../helpers/utils/getLocal";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { SelectMenuInterface } from "../../../types/InteractionInterfaces";
import isCooldowned from "../../../validator/isCooldowned";

const event: DiscordEventInterface = async (
  client,
  interaction: StringSelectMenuInteraction
) => {
  if (!interaction.isStringSelectMenu()) return;
  if (!interaction.customId.startsWith("$")) return;

  try {
    const selectMenuObject = getLocalById<SelectMenuInterface>(
      path.join(__dirname, "../../../menus/selects"),
      interaction.customId.replace("$", ""),
      interaction.values[0]
    );

    if (!selectMenuObject) return;
    await interaction.message.edit({
      components: interaction.message.components,
    });

    if (selectMenuObject.voiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw {
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        };
    }

    if (selectMenuObject.cooldown) {
      const { cooldowned, nextTime } = isCooldowned(
        interaction.customId.slice(1),
        "button",
        selectMenuObject.cooldown,
        interaction.user.id
      );

      if (!cooldowned && nextTime)
        throw {
          name: "Cooldown",
          message: `Please wait <t:${nextTime}:R> before using this select menu again.`,
          type: "warning",
        };
    }

    selectMenuObject.botPermissions?.push(...config.defaultPermissions);
    if (selectMenuObject.botPermissions?.length) {
      for (const permission of selectMenuObject.botPermissions) {
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

    if (selectMenuObject.permissionsRequired?.length) {
      for (const permission of selectMenuObject.permissionsRequired) {
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

    selectMenuObject.execute(interaction, client);
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
