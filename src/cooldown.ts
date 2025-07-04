import path from "path";
import jsonStore from "json-store-typed";

/**
 * JSON-based storage to persist user interaction cooldowns.
 * Each user ID maps to a set of cooldown keys with last-used timestamps.
 */
const cooldownInteractionOfUserLists = jsonStore(
  path.join(__dirname, "../database/cooldowns.json")
);

/**
 * Defines the structure for cooldown data passed between functions.
 */
export interface CooldownPayload {
  interactionName: string;
  type: "command" | "context" | "button" | "select";
  time: number;
  userId: string;
}

/**
 * Defines the structure of the cooldown check result.
 */
export interface CooldownData {
  cooledDown: boolean;
  nextTime?: number;
  payload: CooldownPayload;
}

/**
 * Checks whether a user is currently on cooldown for a specific interaction.
 * @param interactionName - The name of the interaction (e.g., command or button ID).
 * @param type - The type of interaction (command, context, button, or select).
 * @param time - Cooldown time in seconds.
 * @param userId - The Discord user ID to check cooldown for.
 * @returns An object indicating whether the cooldown has expired and metadata about the request.
 */
export function isCooledDown(
  interactionName: string,
  type: "command" | "context" | "button" | "select",
  time: number,
  userId: string
): CooldownData {
  const cooldownKey = `${type}.${interactionName}`;
  const userCooldownList = cooldownInteractionOfUserLists.get(userId) || {};

  const currentTime = Math.floor(Date.now() / 1000);
  const lastUsed = userCooldownList[cooldownKey];

  // If the user has not used the interaction before or cooldown has expired
  if (!lastUsed || currentTime - lastUsed > time) {
    return {
      cooledDown: true,
      payload: {
        interactionName,
        type,
        time,
        userId,
      },
    };
  }

  // Still in cooldown period
  return {
    cooledDown: false,
    nextTime: lastUsed + time,
    payload: {
      interactionName,
      type,
      time,
      userId,
    },
  };
}

/**
 * Updates the cooldown timestamp for a specific user interaction.
 * @param payload - The payload originally returned by `isCooledDown` containing interaction details and user ID.
 */
export function updateCooldown(data: CooldownData | undefined | null) {
  if (!data) return;

  const { interactionName, type, userId } = data.payload;
  const cooldownKey = `${type}.${interactionName}`;
  const userCooldownList = cooldownInteractionOfUserLists.get(userId) || {};
  const currentTime = Math.floor(Date.now() / 1000);

  // Record the latest usage timestamp
  userCooldownList[cooldownKey] = currentTime;
  cooldownInteractionOfUserLists.set(userId, userCooldownList);
}
