import Kademlia, { KvsModule, PeerModule, genKid } from "kad-rtc";

import { Option } from "kad-rtc/lib/kademlia/ktable";
export const genKad = (option?: Option) =>
  new Kademlia(genKid(), { peerCreate: PeerModule, kvs: KvsModule }, option);
