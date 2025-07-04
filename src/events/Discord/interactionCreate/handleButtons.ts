import path from "path";
import { GuildMember, Interaction } from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { getLocalById } from "../../../helpers/utils/getLocal";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkPermission from "../../../validator/checkPermission";
import { CooldownData, isCooledDown, updateCooldown } from "../../../cooldown";
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

    if (buttonObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This button is for developers only.",
          type: "warning",
        });
    }

    // Check if the user is required to be in a voice channel
    if (buttonObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw new CustomError({
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        });
    }

    let cooldownData: CooldownData | undefined;

    // Check for button cooldown
    if (buttonObject.cooldown) {
      const cooldownResponse = isCooledDown(
        interaction.customId.slice(1),
        "button",
        buttonObject.cooldown,
        interaction.user.id
      );

      // If the button is not cooledDown, throw an error
      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this button again.`,
          type: "warning",
        });

      cooldownData = cooldownResponse;
    }

    // Check for permissions
    checkPermission(
      interaction.member?.permissions,
      interaction.guild?.members.me?.permissions,
      buttonObject.botPermissionsRequired,
      buttonObject.userPermissionsRequired
    );

    // Execute the button's action
    const succeed = await buttonObject.execute(interaction, client) ?? true;
    if (succeed) updateCooldown(cooldownData);
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Button Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error);
  }
};

export default event;
