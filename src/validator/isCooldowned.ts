import path from "path";
import jsonStore from "json-store-typed";

const cooldownInteractionOfUserLists = jsonStore(
  path.join(__dirname, "../../database/cooldowns.json")
);

export default (
  interactionName: string,
  type: "command" | "context" | "button" | "select",
  time: number,
  userId: string
): {
  cooldowned: boolean;
  nextTime?: number;
} => {
  const cooldownKey = `${type}.${interactionName}`;
  const userCooldowns = cooldownInteractionOfUserLists.get(userId) || {};
  const currentTime = Math.floor(Date.now() / 1000);

  const lastUsed = userCooldowns[cooldownKey];

  if (!lastUsed || currentTime - lastUsed > time) {
    userCooldowns[cooldownKey] = currentTime;
    cooldownInteractionOfUserLists.set(userId, userCooldowns);
    return {
      cooldowned: true,
    };
  }

  return {
    cooldowned: false,
    nextTime: lastUsed + time,
  };
};
