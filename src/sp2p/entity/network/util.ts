import Kademlia, { Options } from "../../../vendor/kademlia";

import KeyValueStore from "../../../vendor/kademlia/modules/kvs/base";
import { PeerCreater } from "../../module/peerCreater";
import genKid from "../../../vendor/kademlia/util/kid";

export const genKad = (
  peerCreate: PeerCreater,
  kid: string,
  option?: Options
) =>
  new Kademlia(
    kid,
    {
      peerCreate: (kid: string) => peerCreate.create(kid),
      kvs: new KeyValueStore()
    },
    option
  );
