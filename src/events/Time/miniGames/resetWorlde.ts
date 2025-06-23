import MiniGameUserDatas from "../../../models/MiniGameUserDatas";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    await MiniGameUserDatas.updateMany(
      { worldeGame: { $exists: true, $ne: null } },
      { $set: { worldeGame: null } }
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
