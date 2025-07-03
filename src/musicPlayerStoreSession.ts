import config from "./config";
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
export class MusicPlayerSession {
  private readonly guildId: string;

  /**
   * Creates a new MusicPlayerSession instance.
   * @param guildId The ID of the guild this session belongs to.
   */
  constructor(guildId: string) {
    this.guildId = guildId;
    if (!sessionMap.has(guildId)) {
      sessionMap.set(guildId, {});
    }
  }

  /**
   * Gets the internal session data object for the guild.
   */
  private get data() {
    return sessionMap.get(this.guildId)!;
  }

  /**
   * Sets the volume level for the guild.
   * @param level The volume level to set.
   */
  public setVolume(level: number) {
    this.data.volume = level;
  }

  /**
   * Retrieves the volume level for the guild.
   * If no volume is set, it defaults to the volume stored in the guild settings.
   * @returns The current volume level.
   */
  public async getVolume() {
    const queue = useQueue(this.guildId);
    return (
      this.data.volume ||
      Number(queue?.options.volume) ||
      (await config.modules(this.guildId)).music.volume
    );
  }

  /**
   * Sets the number of times the queue has been shuffled for the guild.
   * @param times The number of times the queue has been shuffled.
   */
  public setShuffledTimes(times: number) {
    this.data.shuffledTimes = times;
  }

  /**
   * Adds one to the number of times the queue has been shuffled for the guild.
   */
  public addShuffledTimes() {
    this.data.shuffledTimes = (this.data.shuffledTimes ?? 0) + 1;
  }

  /**
   * Retrieves the number of times the queue has been shuffled for the guild.
   * @returns The number of times the queue has been shuffled.
   */
  public getShuffledTimes() {
    return this.data.shuffledTimes ?? 0;
  }

  /**
   * Determines whether the queue has been shuffled at least once.
   * @returns True if the queue has been shuffled, false otherwise.
   */
  public isShuffled() {
    return (this.data.shuffledTimes ?? 0) > 0;
  }

  /**
   * Sets the loop mode for the guild.
   * @param mode The loop mode to set.
   */
  public setRepeatMode(mode: QueueRepeatMode) {
    this.data.repeatMode = mode;
  }

  /**
   * Retrieves the loop mode for the guild.
   * @returns The current loop mode.
   */
  public getRepeatMode() {
    return this.data.repeatMode ?? QueueRepeatMode.OFF;
  }

  /**
   * Clears all stored session data for the guild.
   */
  public clear() {
    sessionMap.delete(this.guildId);
  }
}
