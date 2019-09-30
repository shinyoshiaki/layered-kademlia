import { SubNetwork } from "../../entity/network/sub";

export class SubNetworkManager {
  private list: { [url: string]: SubNetwork } = {};

  createNetwork(url: string) {
    if (this.isExist(url)) this.list[url];
    this.list[url] = new SubNetwork();
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }
}
