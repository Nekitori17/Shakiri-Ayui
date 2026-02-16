import MiniGameUserData from "../../../models/UserMiniGameData";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    await MiniGameUserData.updateMany(
      { wordleGame: { $exists: true, $ne: null } },
      { $set: { wordleGame: null } }
    );
  },
  mode: "INTERVAL",
  schedule: {
    interval: 86400,
    startTime: {
      hours: 0,
      minutes: 0,
    },
  },
};

export default schedule;
