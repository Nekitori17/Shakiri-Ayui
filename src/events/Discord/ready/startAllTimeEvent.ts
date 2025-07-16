import path from "path";
import { getLocal } from "../../../helpers/utils/getLocal";
import { errorLogger } from "../../../helpers/utils/handleError";
import {
  DiscordEventInterface,
  TimeEventInterface,
} from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client, c) => {
  try {
    // Get all local time-based events
    const localTimeEvents = getLocal<TimeEventInterface>(
      path.join(__dirname, "../../Time")
    );

    // Helper function to run the execute method of a time event
    function runExecute(timeEvent: TimeEventInterface) {
      timeEvent.execute(client);
    }

    // Iterate over each time event and schedule it based on its mode
    for (const timeEvent of localTimeEvents) {
      switch (timeEvent.mode) {
        case "INTERVAL": {
          // Destructure interval and startTime from the schedule
          const { interval, startTime } = timeEvent.schedule;

          // Get current time
          const now = Date.now();
          // Calculate the first start time for today
          const firstStart = new Date();
          firstStart.setHours(startTime.hours, startTime.minutes, 0, 0);

          let delay: number;

          // If the first start time is in the future today
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

          // Schedule the first execution after the calculated delay
          setTimeout(() => {
            runExecute(timeEvent);
            // Then set up a recurring interval for subsequent executions
            setInterval(() => runExecute(timeEvent), interval * 1000);
          }, delay);

          break;
        }

        case "WEEKDAY": {
          // Destructure weekdays and startTime from the schedule
          const { weekdays, startTime } = timeEvent.schedule;
          // Define a function to check and run the event
          const checkAndRun = () => {
            const now = new Date();
            // Map day numbers to their string representations
            const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const today = dayMap[now.getDay()];
            // Check if today is one of the scheduled weekdays and if the current time matches the start time
            if (
              weekdays.includes(today as any) &&
              now.getHours() === startTime.hours &&
              now.getMinutes() === startTime.minutes
            ) {
              // If conditions met, run the event
              runExecute(timeEvent);
            }
          };

          // Set an interval to check and run the event every minute
          setInterval(checkAndRun, 60 * 1000);
          break;
        }

        case "EXACT": {
          const { schedule } = timeEvent;
          const now = new Date();

          // Create a Date object for the exact scheduled time
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
          // Define the maximum timeout value for setTimeout
          const MAX_TIMEOUT = 2_147_483_647;

          // If there's a delay
          if (delay > 0) {
            // If the delay is greater than the maximum timeout, use a recursive setTimeout
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
              // Otherwise, set a single timeout
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
