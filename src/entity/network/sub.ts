import { Item, Peer } from "../../vendor/kademlia";
import { StaticMeta, StreamMeta } from "../data/meta";

import { Chunk } from "../data/stream";
import { genKad } from "./util";
import { mergeArraybuffer } from "../../util/arraybuffer";

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

  async addPeer(peer: Peer) {
    await this.kad.add(peer);
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
    let retry = 0;
    while (true) {
      const res = await this.kad.findValue(target);
      if (!res) {
        if (retry < 5) {
          retry++;
          console.warn({ retry });
          await new Promise(r => setTimeout(r, this.kad.di.opt.timeout));
          continue;
        }
        console.warn("error");
        cb({ type: "error" });
        break;
      }
      retry = 0;
      const { item } = res;
      const order = JSON.parse(item.msg!) as Chunk;
      if (order.next === "end") {
        cb({ type: "complete" });
        break;
      }
      target = order.next;
      cb({ type: "chunk", chunk: item.value as ArrayBuffer });
      await new Promise(r => setTimeout(r, payload.cycle));
    }
  }
}
