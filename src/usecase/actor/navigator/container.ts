import { CreatePeer } from "../../../service/peer/createPeer";
import { MainNetwork } from "../../../entity/network/main";
import { NavigatorManager } from "../../../service/actor/manager/navigator";
import { SeederManager } from "../../../service/actor/manager/seeder";
import { SubNetworkManager } from "../../../service/network/submanager";
import { meta2URL } from "../../../entity/data/meta";

export class NavigatorContainer {
  constructor(
    services: {
      NavigatorManager: NavigatorManager;
      SubNetworkManager: SubNetworkManager;
      SeederManager: SeederManager;
      CreatePeer: CreatePeer;
    },
    mainNet: MainNetwork
  ) {
    const {
      SubNetworkManager,
      CreatePeer,
      NavigatorManager,
      SeederManager
    } = services;

    // seeder
    mainNet.onStoreMeta.subscribe(async ({ meta, peer }) => {
      const url = meta2URL(meta);
      const subNet = SubNetworkManager.createNetwork(url);
      const seeder = SeederManager.createSeeder(url, mainNet, subNet);

      NavigatorManager.createNavigator(meta, mainNet, seeder);

      const seederPeer = await CreatePeer.connect(url, peer);
      subNet.addPeer(seederPeer);
    });
  }
}
