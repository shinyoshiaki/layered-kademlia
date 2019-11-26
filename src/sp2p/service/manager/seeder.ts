import { InjectServices, Injectable } from "..";

import { MainNetwork } from "../../entity/network/main";
import { Options } from "../../main";
import { Seeder } from "../../entity/actor/seeder";
import { SubNetwork } from "../../entity/network/sub";

export class SeederManager implements Injectable {
  list: { [url: string]: Seeder } = {};

  constructor(private options: Options) {}

  services: InjectServices = true as any;

  createSeeder(url: string, mainNet: MainNetwork, subNet: SubNetwork) {
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new Seeder(
      this.services,
      url,
      mainNet,
      subNet,
      this.options
    );
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }

  get allSeeder() {
    return Object.values(this.list);
  }
}
