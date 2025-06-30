import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = (client, c): void => {
  console.log(`✅ OK! | Logged in as ${c.user.tag}!`);
};

export default event;
