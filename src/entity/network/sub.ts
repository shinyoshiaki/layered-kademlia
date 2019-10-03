import { Item } from "../../vendor/kademlia/modules/kvs/base";
import { Meta } from "../data/meta";
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

  async findMetaTaeget(meta: Meta) {
    const res = await Promise.all(
      meta.keys.map(async key => {
        const res = await this.kad.findValue(key);
        if (!res) return false;
        return res.item;
      })
    );
    if (res.includes(false)) return;
    const chunks = (res as Item[]).map(v => v.value as ArrayBuffer);
    return mergeArraybuffer(chunks);
  }
}
