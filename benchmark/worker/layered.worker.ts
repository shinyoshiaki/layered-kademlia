import Kademlia, {
  KeyValueStore,
  Peer,
  PeerUdpModule
} from "../../src/vendor/kademlia";
import { expose, workerThreadsExposer } from "airpc";

import { PeerCreator } from "../../src/sp2p/module/peerCreator";
import { SP2P } from "../../src/sp2p/main";
import sha1 from "sha1";

export class LayeredWorker {
  private kad = new Kademlia(
    sha1(Math.random().toString()),
    {
      peerCreate: PeerUdpModule,
      kvs: new KeyValueStore()
    },
    {
      timeout: 60_000 * 60 * 24
    }
  );
  private layered = new SP2P(
    { PeerCreator: new PeerCreator(PeerUdpModule) },
    this.kad,
    {
      subNetTimeout: 60_000 * 60 * 24
    }
  );

  private peer?: Peer;

  constructor() {}

  async offer(targetKid: string) {
    const peer = (this.peer = PeerUdpModule(targetKid));
    const sdp = await peer.createOffer();
    return JSON.stringify(sdp);
  }

  async setOffer(targetKid: string, offer: string) {
    const peer = (this.peer = PeerUdpModule(targetKid));
    const sdp = await peer.setOffer(JSON.parse(offer));
    return JSON.stringify(sdp);
  }

  async setAnswer(answer: string) {
    await this.peer!.setAnswer(JSON.parse(answer));
  }

  kadAddPeer() {
    this.kad.add(this.peer!);
  }

  getKid() {
    return this.kad.kid;
  }

  async kadFindNode(kid: string) {
    const res = await this.kad.findNode(kid);
    return res ? true : false;
  }

  async seederStoreStatic(name: string, ab: Buffer) {
    const res = await this.layered.seeder.storeStatic(name, ab).catch(() => {});
    if (!res) return false;
    return res.url;
  }

  async userFindStatic(url: string) {
    const res = await this.layered.user.findStatic(url).catch(() => {});
    if (!res) return false;
    return res;
  }
}

expose(new LayeredWorker(), workerThreadsExposer());
