import { CreatePeer } from "../../service/peer/createPeer";
import { MainNetwork } from "../../entity/network/main";
import { NavigatorManager } from "../../service/actor/manager/navigator";
import { Options } from "../../adapter/actor";
import { RPCSeederStoreDone } from "./seeder";
import { SubNetworkManager } from "../../service/network/submanager";
import { meta2URL } from "../../entity/data/meta";

export class NavigatorContainer {
  constructor(
    services: {
      NavigatorManager: NavigatorManager;
      SubNetworkManager: SubNetworkManager;
      CreatePeer: CreatePeer;
    },
    mainNet: MainNetwork,
    private options: Options = {}
  ) {
    const { SubNetworkManager, CreatePeer, NavigatorManager } = services;

    //from seeder store
    mainNet.onStoreMeta.subscribe(async ({ meta, peer }) => {
      const url = meta2URL(meta);
      const subNet = SubNetworkManager.createNetwork(
        url,
        CreatePeer.peerCreater,
        mainNet.kid
      );

      NavigatorManager.createNavigator(meta, mainNet, subNet);

      await new Promise(r => {
        const { unSubscribe } = mainNet.eventManager
          .selectListen<RPCSeederStoreDone>("RPCSeederStoreDone")
          .subscribe(({ rpc }) => {
            if (rpc.url === url) {
              unSubscribe();
              r();
            }
          });
      });

      const seederPeer = await CreatePeer.connect(url, subNet.kid, peer);
      subNet.addPeer(seederPeer);
      const res = await subNet.findNode();
      this;
    });
  }
}
