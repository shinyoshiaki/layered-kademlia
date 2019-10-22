import { Item, Peer } from "../../../vendor/kademlia";
import { StaticMeta, StreamMeta } from "../data/meta";

import { Chunk } from "../data/stream";
import { genKad } from "./util";
import { mergeArraybuffer } from "../../../util/arraybuffer";

export class SubNetwork {
  private kad = genKad();
  kid = this.kad.kid;
  store = this.kad.store;

  get kvs() {
    return this.kad.di.modules.kvs;
  }
  get kTable() {
    return this.kad.di.kTable;
  }
  get allPeers() {
    return this.kTable.allPeers;
  }

  addPeer(peer: Peer) {
    this.kad.add(peer);
  }

  async findNode() {
    await this.kad.findNode(this.kad.kid);
  }

  findStaticMetaTarget = async (meta: StaticMeta) => {
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
  };

  async findStreamMetaTarget(
    meta: StreamMeta,
    cb: (res: {
      type: "error" | "chunk" | "complete";
      chunk?: ArrayBuffer;
    }) => void
  ) {
    const { payload } = meta;
    let target = payload.first;
    while (true) {
      const res = await this.kad.findValue(target);
      if (!res) {
        cb({ type: "error" });
        break;
      }
      const { item } = res;
      const order = JSON.parse(item.msg!) as Chunk;
      if (order.next === "end") {
        cb({ type: "complete" });
        break;
      }
      target = order.next;
      cb({ type: "chunk", chunk: item.value as ArrayBuffer });
    }
  }
}
