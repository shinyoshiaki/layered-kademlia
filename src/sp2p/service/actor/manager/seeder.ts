import { MainNetwork } from "../../../entity/network/main";
import { PeerCreater } from "../../../module/peerCreater";
import { Seeder } from "../../../entity/actor/seeder";
import { SubNetwork } from "../../../entity/network/sub";

export class SeederManager {
  private list: { [url: string]: Seeder } = {};

  createSeeder(
    url: string,
    mainNet: MainNetwork,
    subNet: SubNetwork,
    peerCreater: PeerCreater
  ) {
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new Seeder(url, mainNet, subNet, peerCreater);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }
}
