import path from "path";
import jsonStore from "json-store-typed";

const cooldownInteractionOfUserLists = jsonStore(
  // Initialize a JSON store to manage user cooldown data
  path.join(__dirname, "../../database/cooldowns.json")
);

// TODO: Rework cooldown system. cuz when catch a error it's still count and update the cooldown of user
/**
 *  * * Checks if a user is currently on cooldown for a specific interaction.
 * @param interactionName The name of the interaction (e.g., "play", "skip").
 * @param type The type of interaction (command, context, button, select).
 * @param time The cooldown duration in seconds.
 * @param userId The ID of the user.
 * @returns An object indicating whether the user is cooled down and the time until the next use if not.
 */
export default (
  interactionName: string,
  type: "command" | "context" | "button" | "select",
  time: number,
  userId: string
): {
  cooledDown: boolean;
  nextTime?: number;
} => {
  // Construct a unique key for the specific interaction type and name
  const cooldownKey = `${type}.${interactionName}`;
  // Retrieve the user's cooldown list or initialize an empty object if none exists
  const userCooldownList = cooldownInteractionOfUserLists.get(userId) || {};
  // Get the current time in seconds since the Unix epoch
  const currentTime = Math.floor(Date.now() / 1000);

  // Get the last time the interaction was used by the user
  const lastUsed = userCooldownList[cooldownKey];

  // Check if the interaction has not been used before or if the cooldown period has passed
  if (!lastUsed || currentTime - lastUsed > time) {
    // Update the last used time for the interaction
    userCooldownList[cooldownKey] = currentTime;
    cooldownInteractionOfUserLists.set(userId, userCooldownList);
    return {
      cooledDown: true,
    };
  }
  // If the user is still on cooldown, return the cooldown status and the time until the next use
  return {
    cooledDown: false,
    nextTime: lastUsed + time,
  };
};
