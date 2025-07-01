import config from "../../../config";
import { ActivityType } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (client) => {
  // Define the structure for a status object
  interface statusObject {
    name: string;
    type: ActivityType;
    status: "idle" | "dnd" | "online";
  }

  // List of statuses to cycle through
  const statusList: statusObject[] = [
    {
      name: "/help",
      type: ActivityType.Listening,
      status: "online",
    },
    {
      name: "Developed by Nekitori17",
      type: ActivityType.Competing,
      status: "dnd",
    },
    {
      name: "I'm the cutest bot",
      type: ActivityType.Watching,
      status: "idle",
    },
  ];

  // Initialize index for cycling through statuses
  let index: number = 0;
  setInterval((): void => {
    if (index === statusList.length) index = 0;
    client.user?.setPresence({
      activities: [
        {
          name: statusList[index].name,
          type: statusList[index].type,
        },
      ],
      status: statusList[index].status,
    });
    index++;
  }, config.statusIntervalTime);
};

export default event;
