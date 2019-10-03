import Kademlia from "../../vendor/kademlia";
import KeyValueStore from "../../vendor/kademlia/modules/kvs/base";
import { Option } from "../../vendor/kademlia/ktable";
import PeerModule from "../../vendor/kademlia/modules/peer";
import genKid from "../../vendor/kademlia/util/kid";

export const genKad = (option?: Option) =>
  new Kademlia(
    genKid(),
    { peerCreate: PeerModule, kvs: new KeyValueStore() },
    option
  );
