import { Peer } from "../../vendor/kademlia";

export class PeerCreater {
  constructor(private creater: (s: string) => Peer) {}
  create(id: string) {
    return this.creater(id);
  }
}
