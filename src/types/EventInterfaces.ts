import { Client } from "discord.js";
import { Player } from "discord-player";
import { IntRange } from "./UtilsGeneric";

export type DiscordEventInterface = (client: Client, ...args: any) => void;
export type MusicEventInterface = (player: Player, client?: Client) => void;

type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
interface Time {
  hours: IntRange<0, 23>;
  minutes: IntRange<0, 59>;
}

interface RecurringInterval {
  interval: number;
  startTime: Time;
}
interface RecurringWeekday {
  weekdays: Weekday[];
  startTime: Time;
}

interface ExactSchedule extends Time {
  months: IntRange<0, 11>;
  days: IntRange<0, 31>;
}

export type TimeEventInterface =
  | {
      execute: (client: Client) => void;
      mode: "INTERVAL";
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
