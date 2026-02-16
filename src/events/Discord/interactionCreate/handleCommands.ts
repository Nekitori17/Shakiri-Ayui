import { GuildMember, Interaction, MessageFlags } from "discord.js";
import { getCommandObjectByName } from "../../../preloaded";
import checkPermission from "../../../helpers/discord/validators/checkPermission";
import { UserInteractionCooldown } from "../../../classes/UserInteractionCooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction,
) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const commandObject = getCommandObjectByName(interaction.commandName);

    if (!commandObject) return;

    if (commandObject.disabled)
      return interaction.reply({
        embeds: [
          client.CommonEmbedBuilder.error({
            title: "Command Disabled",
            description: "This command is currently disabled.",
          }),
        ],
        flags: MessageFlags.Ephemeral,
      });

    if (!commandObject.useInDm)
      if (!interaction.guild) {
        await interaction.user.send({
          embeds: [
            client.CommonEmbedBuilder.error({
              title: "Can't Use In Dm",
              description: "This command can't be used in DMs.",
            }),
          ],
        });
        return;
      }

    //
    if (commandObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ",",
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new client.CustomError({
          name: "DeveloperOnly",
          message: "This command is for developers only.",
          type: "warning",
        });
    }

    let userCooldown = new UserInteractionCooldown(interaction.user.id);

    if (commandObject.cooldown) {
      const cooldownResponse = userCooldown.isCooledDown(
        interaction.commandName,
        "command",
        commandObject.cooldown,
      );

      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new client.CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this command again.`,
          type: "warning",
        });
    }

    if (commandObject.requiredVoiceChannel) {
      if (!(interaction.member as GuildMember).voice.channel)
        throw new client.CustomError({
          name: "NoVoiceChannel",
          message: "To use this command, you must be in a voice channel",
        });
    }

    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild.members.me?.permissions,
        commandObject.botPermissionsRequired,
        commandObject.userPermissionsRequired,
      );
    }

    const succeed = (await commandObject.execute(interaction, client)) ?? true;
    if (succeed && commandObject.cooldown) userCooldown.updateCooldown();
  } catch (error) {
    if (error instanceof Error && !(error instanceof client.CustomError)) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Command Interaction)\x1b[0m`,
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    client.interactionErrorHandler(interaction, error);
  }
};

export default event;
