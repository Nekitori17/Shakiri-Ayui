import { ActivityType, Client } from "discord.js";
import { DiscordEventInterface } from "../../../types/EventInterfaces";
import config from "../../../config";

const execute: DiscordEventInterface = async (client: Client) => {
  interface statusObject {
    name: string;
    type: ActivityType;
    status: "idle" | "dnd" | "online";
  }

  const statusArray: statusObject[] = [
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

  let nth: number = 0;
  setInterval((): void => {
    if (nth === statusArray.length) nth = 0;
    client.user?.setPresence({
      activities: [
        {
          name: statusArray[nth].name,
          type: statusArray[nth].type,
        },
      ],
      status: statusArray[nth].status,
    });
    nth++;
  }, config.statusIntervalTime);
};

export default execute;
