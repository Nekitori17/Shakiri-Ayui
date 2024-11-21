import { DiscordEventInterface } from "../../../types/EventInterfaces";

const execute: DiscordEventInterface = (client: any, c: any): void => {
  console.log(`✅ OK! | Logged in as ${c.user.tag}!`);
};

export default execute;
