import {
  Meta,
  StreamMetaPayload,
  createStaticMeta,
  createStreamMeta
} from "../../../entity/data/meta";

import Event from "rx.mini";
import { MainNetwork } from "../../../entity/network/main";
import { SeederManager } from "../../../service/actor/manager/seeder";
import { SubNetworkManager } from "../../../service/network/submanager";

export class SeederContainer {
  constructor(
    private services: {
      SubNetworkManager: SubNetworkManager;
      SeederManager: SeederManager;
    },
    private mainNet: MainNetwork
  ) {}

  connect = async (meta: Meta) => {
    const { SeederManager, SubNetworkManager } = this.services;

    const { url, peers } = await this.mainNet.store(meta);
    const subNet = SubNetworkManager.createNetwork(url);
    const seeder = SeederManager.createSeeder(url, this.mainNet, subNet);

    await Promise.all(
      peers.map(
        peer =>
          new Promise(r => {
            const { unSubscribe } = seeder.onNewNavigatorConnect.subscribe(
              id => {
                if (peer.kid === id) {
                  unSubscribe();
                  r();
                }
              }
            );
          })
      )
    );

    return { seeder, url };
  };

  storeStatic = async (name: string, ab: ArrayBuffer) => {
    const { meta, chunks } = createStaticMeta(name, ab);
    const { seeder, url } = await this.connect(meta);

    chunks.forEach(ab => seeder.setAsset(ab));

    return { url, meta };
  };

  async storeStream(
    name: string,
    first: ArrayBuffer,
    payload: Omit<StreamMetaPayload, "first">
  ) {
    const meta = createStreamMeta(name, first, payload);
    const { seeder, url } = await this.connect(meta);

    const event = new Event<ArrayBuffer | undefined>();
    let prev = first;

    const { unSubscribe } = event.subscribe(ab => {
      seeder.setChunk(prev, ab);
      if (!ab) {
        unSubscribe();
        return;
      }
      prev = ab;
    });

    return { event: event, url };
  }
}
