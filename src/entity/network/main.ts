import Event from "rx.mini";
import Kademlia from "../../vendor/kademlia";
import { Meta } from "../data/meta";
import { Peer } from "../../vendor/kademlia/modules/peer/base";
import { genKad } from "./util";
import sha1 from "sha1";

const metaMessage = "metaMessage";

export class MainNetwork {
  private kad = this.existKad || genKad();
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
