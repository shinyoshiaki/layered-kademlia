import Kademlia, { KvsModule, Peer, PeerModule, genKid } from "kad-rtc";

import { Item } from "kad-rtc/lib/kademlia/modules/kvs/base";
import { Meta } from "../data/meta";
import { mergeArraybuffer } from "../../util/arraybuffer";

export class SubNetwork {
  private kad = new Kademlia(genKid(), {
    peerCreate: PeerModule,
    kvs: KvsModule
  });

  kvs = this.kad.di.modules.kvs;

  store = this.kad.store;

  allPeers = this.kad.di.kTable.allPeers;

  addPeer(peer: Peer) {
    this.kad.add(peer);
  }

  async findMetaTaeget(meta: Meta) {
    const res = await Promise.all(
      meta.keys.map(async key => {
        const res = await this.kad.findValue(key);
        if (!res) return false;
        return res.item;
      })
    );
    if (res.find(v => v === false)) return;
    const chunks = (res as Item[]).map(v => v.value as ArrayBuffer);
    return mergeArraybuffer(chunks);
  }
}
