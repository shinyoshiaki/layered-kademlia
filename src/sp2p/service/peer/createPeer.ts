import { PeerCreater } from "../../module/peerCreater";

export class CreatePeer {
  constructor(private modules: { PeerCreater: PeerCreater } = {} as any) {}

  get peerCreater() {
    return this.modules.PeerCreater;
  }
}
