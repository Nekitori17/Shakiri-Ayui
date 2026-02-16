import { errorLogger } from "../../../helpers/errors/handleError";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client) => {
  try {
    if (!client.config.presenceRotateList) return;

    let index: number = 0;
    setInterval(() => {
      if (index === client.config.presenceRotateList.length) index = 0;
      client.user?.setPresence(client.config.presenceRotateList[index]);
      index++;
    }, client.config.presenceIntervalTime);
  } catch (error) {
    errorLogger(error);
  }
};

export default event;
