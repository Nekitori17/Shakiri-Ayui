import CooldownModel from "../models/InteractionCooldown";

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
  public readonly userId: string;
  private holdingCooldownKey: InteractionName | null = null;
  private holdingTime: number | null = null;

  public constructor(userId: string) {
    this.userId = userId;
  }

  public async isCooledDown(
    interactionName: string,
    type: InteractionType,
    time: number,
  ): Promise<Cooldown> {
    const cooldownKey: InteractionName = `${type}.${interactionName}`;
    const cooldownDoc = await CooldownModel.findOne({
      userId: this.userId,
      commandName: cooldownKey,
    });

    if (!cooldownDoc) {
      this.holdingCooldownKey = cooldownKey;
      this.holdingTime = time;
      return {
        cooledDown: true,
      };
    }

    return {
      cooledDown: false,
      nextTime: Math.floor(cooldownDoc.expireAt.getTime() / 1000),
    };
  }

  public async updateCooldown(): Promise<void>;
  public async updateCooldown(
    interactionName: string,
    type: InteractionType,
    time: number,
  ): Promise<void>;
  public async updateCooldown(
    interactionName?: string,
    type?: InteractionType,
    time?: number,
  ): Promise<void> {
    let cooldownKey: InteractionName;
    let finalTime: number;

    if (time != null) {
      finalTime = time;
    } else if (this.holdingTime != null) {
      finalTime = this.holdingTime;
    } else {
      throw new Error(
        "Cooldown duration must be provided either as an argument or from a previous cooldown check.",
      );
    }

    if (interactionName != null && type != null) {
      cooldownKey = `${type}.${interactionName}`;
    } else if (this.holdingCooldownKey) {
      cooldownKey = this.holdingCooldownKey;
    } else {
      throw new Error(
        "Cooldown key must be provided either as an argument or from a previous cooldown check",
      );
    }

    const expireAt = new Date(Date.now() + finalTime * 1000);

    await CooldownModel.updateOne(
      {
        userId: this.userId,
        commandName: cooldownKey,
      },
      {
        $set: { expireAt },
      },
      {
        upsert: true,
      },
    );

    this.holdingCooldownKey = null;
    this.holdingTime = null;
  }

  public async clear() {
    await CooldownModel.deleteMany({ userId: this.userId });
  }
}
