import { Peer, Item } from "../../../vendor/kademlia";
import { Meta, StaticMeta, StreamMeta } from "../data/meta";

import { Chunk } from "../data/stream";
import Event from "rx.mini";
import { Options } from "../../main";
import { PeerCreator } from "../../module/peerCreator";
import { genKad } from "./util";
import { mergeArraybuffer } from "../../../util/arraybuffer";

export class SubNetwork {
  state: { onFinding?: Event } = { onFinding: undefined };

  constructor(
    private opt: Options,
    private peerCreator: PeerCreator,
    private existKid: string,
    private meta: Meta
  ) {}

  kad = genKad(this.peerCreator, this.existKid, {
    timeout: this.opt.kadTimeout,
    kBucketSize: this.opt.kBucketSize
  });
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
    this.state.onFinding = new Event();
    const res = await this.kad.findNode(this.kad.kid);
    this.state.onFinding!.execute(null);
    this.state.onFinding = undefined;
    return res;
  }

  findStaticMetaTarget = async () => {
    const res = await Promise.all(
      (this.meta as StaticMeta).payload.keys.map(async key => {
        const res = await this.kad.findValue(key);
        if (!res) return false;
        return res.item;
      })
    );
    if (res.includes(false)) return;
    const chunks = (res as Item[]).map(v => v.value as ArrayBuffer);
    return mergeArraybuffer(chunks);
  };

  findStreamMetaTarget = async (
    cb: (res: {
      type: "error" | "chunk" | "complete";
      chunk?: ArrayBuffer;
    }) => void
  ) => {
    const { payload } = this.meta as StreamMeta;
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

      await new Promise(r => setTimeout(r, payload.cycle));
    }
  };
}
