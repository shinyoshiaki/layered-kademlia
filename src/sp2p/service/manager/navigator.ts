import { InjectServices, Injectable } from "..";
import { Meta, meta2URL } from "../../entity/data/meta";

import { MainNetwork } from "../../entity/network/main";
import { Navigator } from "../../entity/actor/navigator";
import { Options } from "../../main";
import { Peer } from "../../../vendor/kademlia";

export class NavigatorManager implements Injectable {
  private list: { [url: string]: Navigator } = {};

  constructor(private options: Options) {}

  services: InjectServices = true as any;

  createNavigator(meta: Meta, mainNet: MainNetwork, seederPeer: Peer) {
    const url = meta2URL(meta);
    if (this.isExist(url)) return this.list[url];

    this.list[url] = new Navigator(
      this.services,
      meta,
      mainNet,
      seederPeer,
      this.options
    );
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }

  deleteNavigator(url: string) {
    delete this.list[url];
  }

  get allNavigator() {
    return Object.values(this.list);
  }
}
