import Kademlia, { Options } from "../../../vendor/kademlia";

import KeyValueStore from "../../../vendor/kademlia/modules/kvs/base";
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
