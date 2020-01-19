import Kademlia from "../../../vendor/kademlia";
import { Meta } from "../data/meta";

const metaMessage = "metaMessage";

export class MainNetwork {
  readonly kad = this.existKad;

  kid = this.kad.kid;

  eventManager = this.kad.di.eventManager;

  constructor(private existKad: Kademlia) {}

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

  deleteData(url: string) {
    const { kvs } = this.kad.di.modules;

    kvs.delete(url);
  }
}
