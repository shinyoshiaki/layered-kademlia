import Kademlia, { KeyValueStore } from "../../src/vendor/kademlia";
import {
  PeerUdpMock,
  PeerUdpModule
} from "../../src/vendor/kademlia/modules/peer/udp";
import {
  closeUdpSocket,
  setUpSocket
} from "../../src/vendor/kademlia/modules/peer/udp";

import { expose } from "airpc";
import sha1 from "sha1";
import { sliceArraybuffer } from "../../src/util/arraybuffer";
import { workerThreadsExposer } from "airpc/module/workerThreads";

const timeout = 5_000;

export class KadWorker {
  private kad = new Kademlia(
    sha1(Math.random().toString()),
    {
      peerCreate: PeerUdpModule,
      kvs: new KeyValueStore()
    },
    { timeout }
  );

  private peer?: PeerUdpMock;

  async init() {
    await setUpSocket();
  }

  async dispose() {
    await closeUdpSocket();
  }

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
    const chunks = sliceArraybuffer(buffer, 1);
    const arr = (
      await Promise.all(
        chunks.map(
          async chunk => await this.kad.store(chunk).catch(() => undefined)
        )
      )
    )
      .map(v => v?.item.key)
      .filter(v => !!v) as string[];

    return arr;
  }

  async kadFindValue(keys: string[]) {
    const chunks = (
      await Promise.all(
        keys.map(
          async key => await this.kad.findValue(key).catch(() => undefined)
        )
      )
    )
      .map(res =>
        res ? new Uint8Array(res.item.value as ArrayBuffer) : undefined
      )
      .filter(v => !!v) as Uint8Array[];

    return chunks;
  }

  getAllMainNetPeers() {
    return this.kad.di.kTable.allKids;
  }
}

expose(new KadWorker(), workerThreadsExposer());
