import Kademlia, { Options } from "../../vendor/kademlia";

import KeyValueStore from "../../vendor/kademlia/modules/kvs/base";
import PeerModule from "../../vendor/kademlia/modules/peer";
import genKid from "../../vendor/kademlia/util/kid";

export const genKad = (option?: Options) =>
  new Kademlia(
    genKid(),
    { peerCreate: PeerModule, kvs: new KeyValueStore() },
    option
  );
