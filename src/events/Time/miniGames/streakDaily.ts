import MiniGameUserData from "../../../models/MiniGameUserData";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 2);
    cutoffDate.setHours(0, 0, 0, 0);

    await MiniGameUserData.updateMany(
      {
        lastDaily: {
          $exists: true,
          $ne: null,
          $lt: cutoffDate,
        },
      },
      { $set: { lastDaily: null, dailyStreak: 0 } }
    );
  },
  mode: "INTERVAL",
  schedule: {
    interval: 86400,
    startTime: { hours: 0, minutes: 0 },
  },
};

export default schedule;
