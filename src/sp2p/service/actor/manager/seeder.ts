import { InjectServices } from "../..";
import { MainNetwork } from "../../../entity/network/main";
import { Seeder } from "../../../entity/actor/seeder";
import { SubNetwork } from "../../../entity/network/sub";

export class SeederManager {
  list: { [url: string]: Seeder } = {};

  createSeeder(
    url: string,
    mainNet: MainNetwork,
    subNet: SubNetwork,
    services: InjectServices
  ) {
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new Seeder(services, url, mainNet, subNet);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }

  get allSeeder() {
    return Object.values(this.list);
  }
}
