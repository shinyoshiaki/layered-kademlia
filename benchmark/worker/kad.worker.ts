import Kademlia, {
  KeyValueStore,
  PeerUdpMock,
  PeerUdpModule
} from "../../src/vendor/kademlia";
import { expose, workerThreadsExposer } from "airpc";

import sha1 from "sha1";

export class KadWorker {
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

  private peer?: PeerUdpMock;

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

  async kadStore(buffer: Buffer) {
    const res = await this.kad.store(buffer).catch(() => {});
    if (res) {
      return res.item;
    }
    return undefined;
  }

  async kadFindValue(key: string) {
    const res = await this.kad.findValue(key);
    return res ? res.item : undefined;
  }
}

expose(new KadWorker(), workerThreadsExposer());
