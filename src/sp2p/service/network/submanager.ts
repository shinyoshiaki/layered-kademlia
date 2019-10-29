import Event from "rx.mini";
import { Meta } from "../../entity/data/meta";
import { PeerCreater } from "../../module/peerCreater";
import { SubNetwork } from "../../entity/network/sub";
import sha1 from "sha1";

export class SubNetworkManager {
  list: { [url: string]: SubNetwork } = {};

  event = new Event();

  createNetwork(meta: Meta, peerCrater: PeerCreater, kid: string) {
    const url = sha1(JSON.stringify(meta));
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new SubNetwork(peerCrater, kid, meta);
    this.event.execute(null);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }

  getSubNetwork(url: string) {
    return this.list[url];
  }
}
