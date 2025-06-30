import { Client } from "discord.js";
import { Player } from "discord-player";
import { IntRange } from "./UtilsGeneric";

/**
 * Interface for Discord event handlers.
 * These receive the Discord client and any additional event arguments.
 */
export type DiscordEventInterface = (client: Client, ...args: any) => void;

/**
 * Interface for music-related event handlers using discord-player.
 * Optionally includes the Discord client.
 */
export type MusicEventInterface = (player: Player, client?: Client) => void;

/**
 * Day of the week, in 3-letter uppercase format.
 */
type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

/**
 * Represents a time of day.
 */
interface Time {
  /** Hour value from 0 to 23 */
  hours: IntRange<0, 23>;

  /** Minute value from 0 to 59 */
  minutes: IntRange<0, 59>;
}

/**
 * Scheduling configuration for recurring events based on interval.
 */
interface RecurringInterval {
  /** Interval in milliseconds between executions */
  interval: number;

  /** Time of day to start counting interval from */
  startTime: Time;
}

/**
 * Scheduling configuration for recurring events on specific weekdays.
 */
interface RecurringWeekday {
  /** Array of weekdays the event should run on */
  weekdays: Weekday[];

  /** Time of day the event should trigger */
  startTime: Time;
}

/**
 * Scheduling configuration for a specific date and time.
 */
interface ExactSchedule extends Time {
  /** Month of execution (0 = January, 11 = December) */
  months: IntRange<0, 11>;

  /** Day of the month to execute (1–31 depending on month) */
  days: IntRange<0, 31>;
}

/**
 * Union type defining different time-based scheduling strategies.
 * - INTERVAL: runs repeatedly based on time interval.
 * - WEEKDAY: runs on selected weekdays at a specific time.
 * - EXACT: runs on an exact month, day, and time.
 */
export type TimeEventInterface =
  | {
      /** Function to execute when the scheduled time triggers */
      execute: (client: Client) => void;

      /** Mode: recurring at regular time intervals */
      mode: "INTERVAL";

      /** Schedule details for interval mode */
      schedule: RecurringInterval;
    }
  | {
      execute: (client: Client) => void;
      mode: "WEEKDAY";
      schedule: RecurringWeekday;
    }
  | {
      execute: (client: Client) => void;
      mode: "EXACT";
      schedule: ExactSchedule;
    };
