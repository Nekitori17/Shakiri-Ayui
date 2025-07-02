import config from "../../../config";
import path from "path";
import { GuildMember, Interaction, PermissionsBitField } from "discord.js";
import sendError from "../../../helpers/utils/sendError";
import { getLocal } from "../../../helpers/utils/getLocal";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import isCooledDown from "../../../validator/isCooledDown";
import checkPermission from "../../../validator/checkPermission";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import { CommandInterface } from "../../../types/InteractionInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  // Check if the interaction is a chat input command
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocal<CommandInterface>(
    path.join(__dirname, "../../../commands")
  );

  try {
    // Find the command object based on the interaction's command name
    const commandObject = localCommands.find(
      (command) => command.name === interaction.commandName
    );

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
        throw {
          name: "DeveloperOnly",
          message: "This command is for developers only.",
          type: "warning",
        };
    }

    // Check for command cooldown
    if (commandObject.cooldown) {
      // Check if the command is currently cooledDown for the user
      const { cooledDown, nextTime } = isCooledDown(
        interaction.commandName,
        "command",
        commandObject.cooldown,
        interaction.user.id
      );

      // If the command is not cooledDown, throw an error
      if (!cooledDown && nextTime)
        throw {
          name: "Cooldown",
          message: `Please wait <t:${nextTime}:R> before using this command again.`,
          type: "warning",
        };
    }

    // Check if the command requires the user to be in a voice channel
    if (commandObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw {
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        };
    }

    // Check for permissions
    checkPermission(
      interaction.member?.permissions,
      interaction.guild?.members.me?.permissions,
      commandObject.botPermissionsRequired,
      commandObject.userPermissionsRequired
    );

    // Execute the command
    commandObject.execute(interaction, client);
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
