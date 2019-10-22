import { Meta, meta2URL } from "../../../entity/data/meta";

import { MainNetwork } from "../../../entity/network/main";
import { Navigator } from "../../../entity/actor/navigator";
import { SubNetwork } from "../../../entity/network/sub";

export class NavigatorManager {
  private list: { [url: string]: Navigator } = {};

  createNavigator(meta: Meta, mainNet: MainNetwork, subNet: SubNetwork) {
    const url = meta2URL(meta);
    if (this.isExist(url)) return this.list[url];

    this.list[url] = new Navigator(meta, mainNet, subNet);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }
}
