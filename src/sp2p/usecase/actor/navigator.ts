import { CreatePeer } from "../../service/peer/createPeer";
import { MainNetwork } from "../../entity/network/main";
import { NavigatorManager } from "../../service/actor/manager/navigator";
import { SubNetworkManager } from "../../service/network/submanager";
import { meta2URL } from "../../entity/data/meta";

export class NavigatorContainer {
  constructor(
    services: {
      NavigatorManager: NavigatorManager;
      SubNetworkManager: SubNetworkManager;
      CreatePeer: CreatePeer;
    },
    mainNet: MainNetwork
  ) {
    const { SubNetworkManager, CreatePeer, NavigatorManager } = services;

    //from seeder store
    mainNet.onStoreMeta.subscribe(async ({ meta, peer }) => {
      const url = meta2URL(meta);
      const subNet = SubNetworkManager.createNetwork(
        url,
        CreatePeer.peerCreater
      );

      NavigatorManager.createNavigator(meta, mainNet, subNet);

      await new Promise(r => setTimeout(r, 200));

      const seederPeer = await CreatePeer.connect(url, subNet.kid, peer);
      subNet.addPeer(seederPeer);
      await subNet.findNode();
    });
  }
}
