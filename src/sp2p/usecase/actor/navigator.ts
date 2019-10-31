import { RPCSeederAnswer2Navigator, RPCSeederStoreDone } from "./seeder";

import { InjectServices } from "../../service";
import { MainNetwork } from "../../entity/network/main";
import { Options } from "../../adapter/actor";
import { RPC } from "../../../vendor/kademlia/modules/peer/base";
import { Signal } from "webrtc4me";
import { meta2URL } from "../../entity/data/meta";

export class NavigatorContainer {
  constructor(
    services: InjectServices,
    private mainNet: MainNetwork,
    private options: Options
  ) {
    const { subNetTimeout } = options;
    const { CreatePeer, NavigatorManager, RpcManager } = services;

    //from seeder store
    mainNet.onStoreMeta.subscribe(async ({ meta, peer }) => {
      const url = meta2URL(meta);

      const id = await this.waitForSeeder(url);

      const seederPeer = CreatePeer.peerCreater.create(peer.kid);
      const offer = await seederPeer.createOffer();
      const res = await RpcManager.getWait<RPCSeederAnswer2Navigator>(
        peer,
        RPCNavigatorOffer2Seeder(offer),
        id
      )(subNetTimeout).catch(() => {});
      if (!res) throw new Error("timeout RPCSeederAnswer2Navigator");

      await seederPeer.setAnswer(res.sdp);

      NavigatorManager.createNavigator(services, meta, mainNet, seederPeer);
    });
  }

  private waitForSeeder = (url: string) =>
    new Promise<string>(r => {
      const { unSubscribe } = this.mainNet.eventManager
        .selectListen<RPCSeederStoreDone & RPC>("RPCSeederStoreDone")
        .subscribe(({ rpc }) => {
          if (rpc.url === url) {
            unSubscribe();
            r(rpc.id);
          }
        });
    });
}

const RPCNavigatorOffer2Seeder = (sdp: Signal) => ({
  type: "RPCNavigatorOffer2Seeder" as const,
  sdp
});

export type RPCNavigatorOffer2Seeder = ReturnType<
  typeof RPCNavigatorOffer2Seeder
>;
