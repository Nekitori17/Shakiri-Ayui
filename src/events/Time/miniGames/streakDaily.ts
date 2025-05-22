import UserDatas from "../../../models/UserDatas";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    const cutoffDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const userDatas = await UserDatas.find({
      lastDaily: { $lte: cutoffDate },
    });

    for (const userData of userDatas) {
      userData.lastDaily = null;
      userData.dailyStreak = 0;
      await userData.save();
    }
  },
  mode: "INTERVAL",
  schedule: {
    interval: 86400,
    startTime: {
      hours: 23,
      minutes: 0,
    }
  },
};

export default schedule;
