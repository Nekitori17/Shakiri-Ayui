import MiniGameUserData from "../../../models/UserMiniGameData";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    const DAYS_BEFORE_RESET = 2;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_BEFORE_RESET);
    cutoffDate.setHours(0, 0, 0, 0);

    // Reset streaks for users who haven't played in 2+ days
    const result = await MiniGameUserData.updateMany(
      {
        "daily.lastDaily": {
          $exists: true,
          $ne: null,
          $lt: cutoffDate,
        },
      },
      {
        // Use dot notation to preserve other fields in 'daily' object
        $set: {
          "daily.streak": 0,
          "daily.lastDaily": null,
        },
      },
    );
  },
  mode: "INTERVAL",
  schedule: {
    interval: 86400,
    startTime: { hours: 0, minutes: 0 },
  },
};

export default schedule;
