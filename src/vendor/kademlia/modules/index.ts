import { Peer } from "./peer/base";
import { KeyValueStore } from "./kvs/base";

export type PeerCreator = (kid: string) => Peer;

export type Modules = {
  peerCreate: PeerCreator;
  kvs: KeyValueStore;
};
