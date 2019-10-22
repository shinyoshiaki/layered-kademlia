import { PeerMockModule } from "../vendor/kademlia";

export class PeerCreater {
  create(id: string) {
    return PeerMockModule(id);
  }
}
