import NodeCache from "node-cache";

export const musicPlayerStoreSession = {
  volume: new NodeCache(),
  shuffeld: new NodeCache(),
  loop: new NodeCache(),
};
