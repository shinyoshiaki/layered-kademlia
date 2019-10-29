import Event from "rx.mini";
import { PeerCreater } from "../../module/peerCreater";
import { SubNetwork } from "../../entity/network/sub";

export class SubNetworkManager {
  list: { [url: string]: SubNetwork } = {};

  event = new Event();

  createNetwork(url: string, peerCrater: PeerCreater, kid: string) {
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new SubNetwork(peerCrater, kid);
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
