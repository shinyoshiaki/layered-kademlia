import Kademlia, { Options, KeyValueStore } from "../../../vendor/kademlia";

import { PeerCreator } from "../../module/peerCreator";

export const genKad = (peerCreate: PeerCreator, kid: string, option: Options) =>
  new Kademlia(
    kid,
    {
      peerCreate: (kid: string) => peerCreate.create(kid),
      kvs: new KeyValueStore()
    },
    option
  );
