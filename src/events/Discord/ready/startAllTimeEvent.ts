import path from "path";
import { getLocal } from "../../../helpers/utils/getLocal";
import {
  DiscordEventInterface,
  TimeEventInterface,
} from "../../../types/EventInterfaces";

const execute: DiscordEventInterface = async (client, c) => {
  const localTimeEvents = getLocal<TimeEventInterface>(
    path.join(__dirname, "../../Time")
  );

  function runExecute(event: TimeEventInterface) {
    event.execute(client);
  }

  for (const localTimeEvent of localTimeEvents) {
    switch (localTimeEvent.mode) {
      case "INTERVAL": {
        const { interval, startTime } = localTimeEvent.schedule;

        const now = Date.now();
        const firstStart = new Date();
        firstStart.setHours(startTime.hours, startTime.minutes, 0, 0);

        let delay: number;

        if (firstStart.getTime() > now) {
          delay = firstStart.getTime() - now;
        } else {
          const intervalMs = interval * 1000;
          const elapsed = now - firstStart.getTime();
          const nextRun =
            firstStart.getTime() + Math.ceil(elapsed / intervalMs) * intervalMs;
          delay = nextRun - now;
        }

        setTimeout(() => {
          runExecute(localTimeEvent);
          setInterval(() => runExecute(localTimeEvent), interval * 1000);
        }, delay);

        break;
      }

      case "WEEKDAY": {
        const { weekdays, startTime } = localTimeEvent.schedule;
        const checkAndRun = () => {
          const now = new Date();
          const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          const today = dayMap[now.getDay()];
          if (
            weekdays.includes(today as any) &&
            now.getHours() === startTime.hours &&
            now.getMinutes() === startTime.minutes
          ) {
            runExecute(localTimeEvent);
          }
        };

        setInterval(checkAndRun, 60 * 1000);
        break;
      }

      case "EXACT": {
        const { schedule } = localTimeEvent;
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

        if (eventDate.getTime() <= now.getTime()) {
          eventDate.setFullYear(eventDate.getFullYear() + 1);
        }

        let delay = eventDate.getTime() - now.getTime();
        const MAX_TIMEOUT = 2_147_483_647;

        if (delay > 0) {
          if (delay > MAX_TIMEOUT) {
            const wait = () => {
              const now = Date.now();
              const remaining = eventDate.getTime() - now;
              if (remaining <= MAX_TIMEOUT) {
                setTimeout(() => localTimeEvent.execute(client), remaining);
              } else {
                setTimeout(wait, MAX_TIMEOUT);
              }
            };
            wait();
          } else {
            setTimeout(() => localTimeEvent.execute(client), delay);
          }
        }
        break;
      }
    }
  }
};

export default execute;
