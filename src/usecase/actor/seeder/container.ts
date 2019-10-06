import { MainNetwork } from "../../../entity/network/main";
import { SeederManager } from "../../../service/actor/manager/seeder";
import { SubNetworkManager } from "../../../service/network/submanager";
import { createStaticMeta } from "../../../entity/data/meta";

export class SeederContainer {
  constructor(
    private services: {
      SubNetworkManager: SubNetworkManager;
      SeederManager: SeederManager;
    },
    private mainNet: MainNetwork
  ) {}

  async storeStatic(name: string, ab: ArrayBuffer) {
    const { SeederManager, SubNetworkManager } = this.services;

    const { meta, chunks } = createStaticMeta(name, ab);
    const { url, peers } = await this.mainNet.store(meta);

    const subNet = SubNetworkManager.createNetwork(url);
    const seeder = SeederManager.createSeeder(url, this.mainNet, subNet);

    await Promise.all(
      peers.map(
        peer =>
          new Promise(r => {
            const { unSubscribe } = seeder.onCreatePeerOffer.subscribe(id => {
              if (peer.kid === id) {
                unSubscribe();
                r();
              }
            });
          })
      )
    );

    chunks.forEach(ab => seeder.setAsset(ab));

    return { url, meta };
  }
}
