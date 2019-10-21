import { ChunkBase, ChunkNext } from "../data/stream";
import { Item, Peer } from "../../vendor/kademlia";
import { StaticMeta, StreamMeta } from "../data/meta";

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
    this.kad.add(peer);
    await this.kad.findNode(this.kad.kid);
    console.log("subnet addpeer");
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
    }) => void,
    opt?: { preferTimeout?: number }
  ) {
    const { payload } = meta;
    const { preferTimeout } = opt || {};

    const state = {
      target: payload.first,
      retry: 0,
      prefetch: true
    };

    while (true) {
      const res = await this.kad.findValue(state.target, { preferTimeout });
      if (!res) {
        if (state.retry < 10) {
          state.prefetch = false;
          console.warn({ retry: state.retry }, this.kad);
          await new Promise(r => setTimeout(r));
          state.retry++;
          continue;
        }
        cb({ type: "error" });
        break;
      } else {
        state.retry = 0;
        state.prefetch = true;
      }

      const wait = state.prefetch ? (payload.cycle / 3) * 2 : payload.cycle;
      await new Promise(r => setTimeout(r, wait));

      const { item } = res;
      let chunk = JSON.parse(item.msg!) as ChunkBase;
      if (chunk.next === "end") {
        cb({ type: "complete" });
        break;
      } else {
        const { next } = chunk as ChunkNext;
        state.target = next;
        cb({ type: "chunk", chunk: item.value as ArrayBuffer });
      }
    }
  }
}
