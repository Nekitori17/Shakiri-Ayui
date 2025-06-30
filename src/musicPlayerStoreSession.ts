import NodeCache from "node-cache";

export const musicPlayerStoreSession = {
  volume: new NodeCache(),
  shuffled: new NodeCache(),
  loop: new NodeCache(),
};
