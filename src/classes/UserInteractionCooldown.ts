import path from "path";
import jsonStore from "json-store-typed";

/**
 * JSON-based storage to persist user interaction cooldowns.
 * Each user ID maps to a set of cooldown keys with last-used timestamps.
 */
const cooldownInteractionOfUserLists = jsonStore(
  path.join(__dirname, "../database/cooldowns.json")
);

export type InteractionType = "command" | "context" | "button" | "select";
export type InteractionName = `${InteractionType}.${string}`;

/**
 * Defines the structure of the cooldown check result.
 */
export interface Cooldown {
  cooledDown: boolean;
  nextTime?: number;
}

export class UserInteractionCooldown {
  public userId: string;
  public cooldownInteractionOfUserList: Record<InteractionName, number>;

  public constructor(userId: string) {
    this.userId = userId;
    this.cooldownInteractionOfUserList =
      cooldownInteractionOfUserLists.get(userId) || {};
  }

  /**
   * Checks if a specific interaction is currently on cooldown for the user.
   * @param interactionName - The name of the interaction (e.g., command name, button ID).
   * @param type - The type of interaction.
   * @param time - The cooldown time in seconds.
   * @returns An object indicating cooldown status and next available time if applicable.
   */
  public isCooledDown(
    interactionName: string,
    type: InteractionType,
    time: number
  ): Cooldown {
    const cooldownKey: InteractionName = `${type}.${interactionName}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const lastUsed = this.cooldownInteractionOfUserList[cooldownKey];

    if (!lastUsed || currentTime - lastUsed > time) {
      return {
        cooledDown: true,
      };
    }

    return {
      cooledDown: false,
      nextTime: lastUsed + time,
    };
  }

  /**
   * Updates the cooldown timestamp for a specific interaction for the user.
   */
  public updateCooldown(
    interactionName: string,
    type: InteractionType
  ) {
    const cooldownKey: InteractionName = `${type}.${interactionName}`;

    this.cooldownInteractionOfUserList[cooldownKey] = Math.floor(
      Date.now() / 1000
    );

    cooldownInteractionOfUserLists.set(
      this.userId,
      this.cooldownInteractionOfUserList
    );
  }

  /**
   * Clears the cooldown data for the user.
   */
  public clear() {
    cooldownInteractionOfUserLists.del(this.userId);
  }
}
