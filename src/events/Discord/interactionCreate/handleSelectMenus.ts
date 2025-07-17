import _ from "lodash";
import { GuildMember, Interaction } from "discord.js";
import { getSelectObject } from "../../../preloaded";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkPermission from "../../../validator/checkPermission";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { CooldownData, isCooledDown, updateCooldown } from "../../../cooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

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
    const selectMenuOptionObject = getSelectObject(
      _.camelCase(interaction.customId.replace("$", "")),
      _.camelCase(interaction.values[0])
    );

    if (!selectMenuOptionObject) return;

    if (selectMenuOptionObject.disabled) return interaction.deferUpdate()

    // Edit the message components to prevent re-selection issues
    await interaction.message.edit({
      components: interaction.message.components,
    });

    // Check if the select menu is for developers only
    if (selectMenuOptionObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This select menu is for developers only.",
          type: "warning",
        });
    }

    if (selectMenuOptionObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw new CustomError({
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        });
    }

    let cooldownData: CooldownData | undefined;

    // Check for select menu cooldown
    if (selectMenuOptionObject.cooldown) {
      const cooldownResponse = isCooledDown(
        interaction.values[0],
        "select",
        selectMenuOptionObject.cooldown,
        interaction.user.id
      );

      // If the select menu is not cooledDown, throw an error
      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this select menu again.`,
          type: "warning",
        });

      cooldownData = cooldownResponse;
    }

    // Check for permissions
    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild?.members.me?.permissions,
        selectMenuOptionObject.botPermissionsRequired,
        selectMenuOptionObject.userPermissionsRequired
      );
    }

    // Execute the select menu's action
    const succeed =
      (await selectMenuOptionObject.execute(interaction, client)) ?? true;
    if (succeed) updateCooldown(cooldownData);
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Select Menu Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    handleInteractionError(interaction, error);
  }
};

export default event;
