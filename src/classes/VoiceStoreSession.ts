import GuildSettings from "../models/GuildSettings";
import { QueueRepeatMode, useQueue } from "discord-player";

interface SessionData {
  volume?: number;
  shuffledTimes?: number;
  repeatMode?: QueueRepeatMode;
}

const sessionMap = new Map<string, SessionData>();

/**
 * Manages the music player session state for a specific guild.
 * This class stores and retrieves settings like volume, shuffle status, and loop mode
 * for a given guild ID.
 */
export class VoiceStoreSession {
  private readonly guildId: string;

  constructor(guildId: string) {
    this.guildId = guildId;
    if (!sessionMap.has(guildId)) {
      sessionMap.set(guildId, {});
    }
  }

  private get data() {
    return sessionMap.get(this.guildId)!;
  }

  public setVolume(level: number) {
    this.data.volume = level;
  }

  public async getVolume() {
    const queue = useQueue(this.guildId);
    return (
      this.data.volume ||
      Number(queue?.options.volume) ||
      (
        await GuildSettings.findOneAndUpdate(
          { guildId: this.guildId },
          { $setOnInsert: { guildId: this.guildId } },
          {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true,
          },
        )
      ).music.volume
    );
  }

  public setShuffledTimes(times: number) {
    this.data.shuffledTimes = times;
  }

  public addShuffledTimes() {
    this.data.shuffledTimes = (this.data.shuffledTimes ?? 0) + 1;
  }

  public getShuffledTimes() {
    return this.data.shuffledTimes ?? 0;
  }

  public isShuffled() {
    return (this.data.shuffledTimes ?? 0) > 0;
  }

  public setRepeatMode(mode: QueueRepeatMode) {
    this.data.repeatMode = mode;
  }

  public getRepeatMode() {
    return this.data.repeatMode ?? QueueRepeatMode.OFF;
  }

  public clear() {
    sessionMap.delete(this.guildId);
  }
}
