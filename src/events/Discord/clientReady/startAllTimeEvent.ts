import path from "path";
import { getLocal } from "../../../helpers/loaders/getLocal";
import { errorLogger } from "../../../helpers/errors/handleError";
import {
  DiscordEventInterface,
  TimeEventInterface,
} from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, c) => {
  try {
    const localTimeEvents = getLocal<TimeEventInterface>(
      path.join(__dirname, "../../Time")
    );

    for (const timeEvent of localTimeEvents) {
      switch (timeEvent.mode) {
        case "INTERVAL": {
          const { interval, startTime } = timeEvent.schedule;

          const now = Date.now();
          const firstStart = new Date();
          firstStart.setHours(startTime.hours, startTime.minutes, 0, 0);

          let delay: number;

          if (firstStart.getTime() > now) {
            delay = firstStart.getTime() - now;
          } else {
            // If the first start time has already passed today, calculate the next run
            const intervalMs = interval * 1000;
            const elapsed = now - firstStart.getTime();
            const nextRun =
              firstStart.getTime() +
              Math.ceil(elapsed / intervalMs) * intervalMs;
            delay = nextRun - now;
          }

          setTimeout(() => {
            timeEvent.execute(client);
            setInterval(() => timeEvent.execute(client), interval * 1000);
          }, delay);

          break;
        }

        case "WEEKDAY": {
          const { weekdays, startTime } = timeEvent.schedule;
          
          // Define a function to check and run the event
          const checkAndRun = () => {
            const now = new Date();
            const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const today = dayMap[now.getDay()];
            // Check if today is one of the scheduled weekdays and if the current time matches the start time
            if (
              weekdays.includes(today as any) &&
              now.getHours() === startTime.hours &&
              now.getMinutes() === startTime.minutes
            ) {
              timeEvent.execute(client);
            }
          };

          setInterval(checkAndRun, 60 * 1000);
          break;
        }

        case "EXACT": {
          const { schedule } = timeEvent;
          const now = new Date();

          const eventDate = new Date(
            now.getFullYear(),
            schedule.months - 1,
            schedule.days,
            schedule.hours,
            schedule.minutes,
            0,
            0
          );

          // If the event date has already passed this year, set it for next year
          if (eventDate.getTime() <= now.getTime()) {
            eventDate.setFullYear(eventDate.getFullYear() + 1);
          }

          // Calculate the delay until the event
          let delay = eventDate.getTime() - now.getTime();
          const MAX_TIMEOUT = 2_147_483_647;

          if (delay > 0) {
            if (delay > MAX_TIMEOUT) {
              const wait = () => {
                const now = Date.now();
                const remaining = eventDate.getTime() - now;
                if (remaining <= MAX_TIMEOUT) {
                  // If remaining time is within MAX_TIMEOUT, set final timeout
                  setTimeout(() => timeEvent.execute(client), remaining);
                } else {
                  setTimeout(wait, MAX_TIMEOUT);
                }
              };
              wait();
            } else {
              setTimeout(() => timeEvent.execute(client), delay);
            }
          }
          break;
        }
      }
    }
  } catch (error) {
    errorLogger(error);
  }
};

export default event;
