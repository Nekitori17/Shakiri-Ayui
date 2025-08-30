import config from "../../../config";
import { errorLogger } from "../../../helpers/utils/handleError";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client) => {
  try {
    if (!config.presenceRotateList) return;

    // Initialize index for cycling through statuses
    let index: number = 0;
    setInterval(() => {
      if (index === config.presenceRotateList.length) index = 0;
      client.user?.setPresence(config.presenceRotateList[index]);
      index++;
    }, config.presenceIntervalTime);
  } catch (error) {
    errorLogger(error);
  }
};

export default event;
