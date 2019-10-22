import { PeerCreater } from "../../module/peerCreater";
import { SubNetwork } from "../../entity/network/sub";

export class SubNetworkManager {
  private list: { [url: string]: SubNetwork } = {};

  createNetwork(url: string, peerCrater: PeerCreater, kid: string) {
    if (this.isExist(url)) this.list[url];
    this.list[url] = new SubNetwork(peerCrater, kid);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }

  getSubNetwork(url: string) {
    return this.list[url];
  }
}
