import { Meta, meta2URL } from "../../../entity/data/meta";

import { MainNetwork } from "../../../entity/network/main";
import { Navigator } from "../../../entity/actor/navigator";
import { Seeder } from "../../../entity/actor/seeder";

export class NavigatorManager {
  private list: { [url: string]: Navigator } = {};

  createNavigator(meta: Meta, mainNet: MainNetwork, seeder: Seeder) {
    const url = meta2URL(meta);
    if (this.isExist(url)) this.list[url];
    this.list[url] = new Navigator(meta, mainNet, seeder);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }
}
