import { Meta, StaticMeta, StreamMeta } from "../data/meta";

import { Chunk } from "../data/stream";
import Event from "rx.mini";
import { Item } from "../../vendor/kademlia/modules/kvs/base";
import { Peer } from "../../vendor/kademlia/modules/peer/base";
import { genKad } from "./util";
import { mergeArraybuffer } from "../../util/arraybuffer";

export class SubNetwork {
  private kad = genKad();
  kid = this.kad.kid;
  store = this.kad.store;

  get kvs() {
    return this.kad.di.modules.kvs;
  }
  get allPeers() {
    return this.kad.di.kTable.allPeers;
  }

  addPeer(peer: Peer) {
    this.kad.add(peer);
  }

  async findStaticMetaTarget(meta: StaticMeta) {
    const res = await Promise.all(
      meta.payload.keys.map(async key => {
        const res = await this.kad.findValue(key);
        if (!res) return false;
        return res.item;
      })
    );
    if (res.includes(false)) return;
    const chunks = (res as Item[]).map(v => v.value as ArrayBuffer);
    return mergeArraybuffer(chunks);
  }

  async findStreamMetaTarget(
    meta: StreamMeta,
    cb: (ab: ArrayBuffer | undefined) => void
  ) {
    const { payload } = meta;
    let target = payload.first;
    while (true) {
      const res = await this.kad.findValue(target);
      if (!res) break;
      const { item } = res;
      const order = JSON.parse(item.msg!) as Chunk;
      if (order.next === "end") break;
      target = order.next;
      cb(item.value as ArrayBuffer);
    }
    cb(undefined);
  }
}
