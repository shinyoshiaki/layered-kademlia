import Kademlia, { KvsModule, Peer, PeerModule, genKid } from "kad-rtc";

import Event from "rx.mini";
import { Meta } from "../data/meta";
import sha1 from "sha1";

const metaMessage = "metaMessage";

export class MainNetwork {
  kad = new Kademlia(genKid(), { peerCreate: PeerModule, kvs: KvsModule });
  onStoreMeta = new Event<{ meta: Meta; peer: Peer }>();

  constructor() {
    const { eventManager } = this.kad.di;

    eventManager.store.subscribe(({ rpc, peer }) => {
      const { msg, value } = rpc;
      if (msg === metaMessage) {
        this.onStoreMeta.execute({
          meta: JSON.parse(value as string) as Meta,
          peer
        });
      }
    });
  }

  async store(v: string) {
    const { key } = await this.kad.store(sha1(v), v, metaMessage);
    return key;
  }

  async findValue(url: string) {
    const res = await this.kad.findValue(url);
    if (!res) return;
    const { peer, item } = res;
    return { peer, meta: JSON.parse(item.value as string) as Meta };
  }
}
