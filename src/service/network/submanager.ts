import Event from "rx.mini";
import { SubNetwork } from "../../entity/network/sub";

export class SubNetworkManager {
  list: { [url: string]: SubNetwork } = {};

  event = new Event();

  createNetwork(url: string) {
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new SubNetwork();
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
