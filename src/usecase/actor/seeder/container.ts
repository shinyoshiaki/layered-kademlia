import { MainNetwork } from "../../../entity/network/main";
import { SeederManager } from "../../../service/actor/manager/seeder";
import { SubNetworkManager } from "../../../service/network/submanager";
import { createMeta } from "../../../entity/data/meta";

export class SeederContainer {
  constructor(
    private services: {
      SubNetworkManager: SubNetworkManager;
      SeederManager: SeederManager;
    },
    private mainNet: MainNetwork
  ) {}

  async store(name: string, ab: ArrayBuffer) {
    const { SeederManager, SubNetworkManager } = this.services;

    const { meta, chunks } = createMeta(name, ab);
    const url = await this.mainNet.store(JSON.stringify(meta));

    const subNet = SubNetworkManager.createNetwork(url);
    const seeder = SeederManager.createSeeder(url, this.mainNet, subNet);
    chunks.forEach(ab => seeder.setAsset(ab));

    return url;
  }
}
