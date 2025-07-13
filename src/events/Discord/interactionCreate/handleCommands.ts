import { GuildMember, Interaction } from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { getExactCommandObject } from "../../../preloaded";
import checkPermission from "../../../validator/checkPermission";
import { CustomError } from "../../../helpers/utils/CustomError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { CooldownData, isCooledDown, updateCooldown } from "../../../cooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  // Check if the interaction is a chat input command
  if (!interaction.isChatInputCommand()) return;

  try {
    // Find the command object based on the interaction's command name
    const commandObject = getExactCommandObject(interaction.commandName);

    if (!commandObject) return;

    // Check if the command can be used in DMs
    if (!commandObject.useInDm)
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

    //
    // Check if the command is for developers only
    if (commandObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This command is for developers only.",
          type: "warning",
        });
    }

    let cooldownData: CooldownData | undefined;

    // Check for command cooldown
    if (commandObject.cooldown) {
      // Check if the command is currently cooledDown for the user
      const cooldownResponse = isCooledDown(
        interaction.commandName,
        "command",
        commandObject.cooldown,
        interaction.user.id
      );

      // If the command is not cooledDown, throw an error
      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this command again.`,
          type: "warning",
        });

      cooldownData = cooldownResponse;
    }

    // Check if the command requires the user to be in a voice channel
    if (commandObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw new CustomError({
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        });
    }

    // Check for permissions
    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild.members.me?.permissions,
        commandObject.botPermissionsRequired,
        commandObject.userPermissionsRequired
      );
    }

    // Execute the command
    const succeed = (await commandObject.execute(interaction, client)) ?? true;
    if (succeed) updateCooldown(cooldownData);
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Command Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    sendError(interaction, error);
  }
};

export default event;
