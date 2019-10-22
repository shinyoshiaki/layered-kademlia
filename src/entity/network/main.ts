import Kademlia, { Peer } from "../../vendor/kademlia";

import Event from "rx.mini";
import { Meta } from "../data/meta";
import { genKad } from "./util";
import sha1 from "sha1";

const metaMessage = "metaMessage";

export class MainNetwork {
  readonly kad = this.existKad || genKad();

  kid = this.kad.kid;
  onStoreMeta = new Event<{ meta: Meta; peer: Peer }>();
  eventManager = this.kad.di.eventManager;

  constructor(private existKad?: Kademlia) {
    this.eventManager.store.subscribe(({ rpc, peer }) => {
      const { msg, value } = rpc;
      if (msg === metaMessage) {
        this.onStoreMeta.execute({
          meta: JSON.parse(value as string) as Meta,
          peer
        });
      }
    });
  }

  store = async (meta: Meta) => {
    const metaStr = JSON.stringify(meta);
    const { item, peers } = await this.kad.store(metaStr, metaMessage);
    const { key } = item;
    return { url: key, peers };
  };

  findValue = async (url: string) => {
    const res = await this.kad.findValue(url);
    if (!res) return;
    const { peer, item } = res;
    return { peer, meta: JSON.parse(item.value as string) as Meta };
  };
}
