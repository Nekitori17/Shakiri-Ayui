import { getCommandObjectByName } from "../../../preloaded";
import { Interaction } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction,
) => {
  if (!interaction.isAutocomplete()) return;

  try {
    const commandObject = getCommandObjectByName(interaction.commandName);

    if (!commandObject) return;
    if (commandObject.disabled) return;
    if (!commandObject.autoComplete) return;

    commandObject.autoComplete(interaction, client);
  } catch (error) {
    client.interactionErrorHandler(interaction, error);
  }
};

export default event;