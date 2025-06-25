import MiniGameUserDatas from "../../../models/MiniGameUserDatas";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    const allUserMinigameData = await MiniGameUserDatas.find();

    const bulkOperations = allUserMinigameData.map((userData) => {
      const newBalance =
        userData.bank.balance +
        Math.floor(userData.bank.balance * userData.bank.interestRate);

      return {
        updateOne: {
          filter: { _id: userData._id },
          update: { "bank.balance": newBalance },
        },
      };
    });

    if (bulkOperations.length > 0) {
      await MiniGameUserDatas.bulkWrite(bulkOperations);
    }
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
