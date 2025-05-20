import path from "path";
import jsonStore from "json-store-typed";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = (client, c) => {
  const cooldownInteractionOfUserLists = jsonStore(
    path.join(__dirname, "../../../../database/cooldowns.json")
  );

  cooldownInteractionOfUserLists.Store = {}
  cooldownInteractionOfUserLists.save();
};

export default event;
