import path from "path";
import jsonStore from "json-store-typed";

const cooldownInteractionOfUserLists = jsonStore(
  path.join(__dirname, "../../database/cooldowns.json")
);

export type InteractionType = "command" | "context" | "button" | "select";
export type InteractionName = `${InteractionType}.${string}`;

export interface Cooldown {
  cooledDown: boolean;
  nextTime?: number;
}

/**
 * Manages user interaction cooldowns, providing methods to check and update cooldowns.
 * This class is intended for use within a single interaction context,
 * allowing for a "holding" state for the current interaction.
 */
export class UserInteractionCooldown {
  public userId: string;
  public cooldownInteractionOfUserList: Record<InteractionName, number>;
  private holdingCooldownKey: string | null = null;

  public constructor(userId: string) {
    this.userId = userId;
    this.cooldownInteractionOfUserList =
      cooldownInteractionOfUserLists.get(userId) || {};
  }

  public isCooledDown(
    interactionName: string,
    type: InteractionType,
    time: number
  ): Cooldown {
    const cooldownKey: InteractionName = `${type}.${interactionName}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const lastUsed = this.cooldownInteractionOfUserList[cooldownKey];

    if (!lastUsed || currentTime - lastUsed > time) {
      this.holdingCooldownKey = cooldownKey;
      return {
        cooledDown: true,
      };
    }

    return {
      cooledDown: false,
      nextTime: lastUsed + time,
    };
  }

  public updateCooldown(): void;
  public updateCooldown(interactionName: string, type: InteractionType): void;
  public updateCooldown(
    interactionName?: string,
    type?: InteractionType
  ): void {
    let cooldownKey: string | null;

    if (interactionName && type) {
      cooldownKey = `${type}.${interactionName}`;
    } else {
      cooldownKey = this.holdingCooldownKey;
    }

    if (!cooldownKey) return;

    this.cooldownInteractionOfUserList[cooldownKey as InteractionName] =
      Math.floor(Date.now() / 1000);

    cooldownInteractionOfUserLists.set(
      this.userId,
      this.cooldownInteractionOfUserList
    );
  }

  public clear() {
    cooldownInteractionOfUserLists.del(this.userId);
  }
}
