import { Peer } from "../../vendor/kademlia";

export class PeerCreator {
  constructor(private creator: (s: string) => Peer) {}
  create(id: string) {
    return this.creator(id);
  }
}
