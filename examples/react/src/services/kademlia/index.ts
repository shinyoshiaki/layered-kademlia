import Kademlia from "../../../../../src/vendor/kademlia";
import KeyValueStore from "../../../../../src/vendor/kademlia/modules/kvs/base";
import PeerModule from "../../../../../src/vendor/kademlia/modules/peer";
import { SP2P } from "../../../../../src/adapter/actor";
import axios from "axios";
import genKid from "../../../../../src/vendor/kademlia/util/kid";

const kad: Kademlia = new Kademlia(
  genKid(),
  {
    peerCreate: PeerModule,
    kvs: new KeyValueStore()
  },
  { kBucketSize: 4 }
);

const actor = new SP2P(kad);

export { kad, actor };

export default async function guest(target: string) {
  const join = await axios.post(target + "/join", {
    kid: kad.kid
  });
  console.log({ join });
  const { kid, offer } = join.data;
  const peer = PeerModule(kid);
  const answer = await peer.setOffer(offer);
  const res = await axios.post(target + "/answer", {
    kid: kad.kid,
    answer
  });
  kad.add(peer);
  if (res) {
    console.log("connected");
    return kad;
  }
}
