import MiniGameUserData from "../../../models/UserMiniGameData";
import { TimeEventInterface } from "../../../types/EventInterfaces";

const schedule: TimeEventInterface = {
  async execute(client) {
    // Fetch all mini-game user data from the database.
    const allMiniGameUserData = await MiniGameUserData.find();

    // Prepare bulk operations to update each user's bank balance.
    const bulkOperations = allMiniGameUserData.map((userData) => {
      // Calculate the new balance after applying interest, ensuring it doesn't exceed capacity.
      let newBalance =
        userData.bank.balance +
        Math.floor(userData.bank.balance * userData.bank.interestRate);

      // Ensure the new balance does not exceed the bank's capacity.
      if (newBalance > userData.bank.capacity) {
        newBalance = userData.bank.capacity;
      }

      return {
        updateOne: {
          filter: { _id: userData._id },
          update: { "bank.balance": newBalance },
        },
      };
    });

    // If there are operations to perform, execute them in bulk.
    if (bulkOperations.length > 0) {
      await MiniGameUserData.bulkWrite(bulkOperations);
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
