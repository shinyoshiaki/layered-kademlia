import { PeerCreator } from "../../module/peerCreator";

export class CreatePeer {
  constructor(public modules: { PeerCreator: PeerCreator } = {} as any) {}

  get peerCreator() {
    return this.modules.PeerCreator;
  }
}
