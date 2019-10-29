import { InjectServices } from "../../service";
import { MainNetwork } from "../../entity/network/main";
import { Options } from "../../adapter/actor";
import { Peer } from "../../../vendor/kademlia";
import { RPCNavigatorBackOfferBySeeder } from "../../entity/actor/navigator";
import { Signal } from "webrtc4me";

export type Network = {
  store: (v: string) => Promise<string>;
  findValue: (url: string) => Promise<Peer | undefined>;
};

export class User {
  constructor(
    private services: InjectServices,
    private mainNet: MainNetwork,
    private options: Options
  ) {}

  connectSubNet = async (url: string) => {
    const { subNetTimeout } = this.options;
    const {
      SubNetworkManager,
      CreatePeer,
      RpcManager,
      SeederManager
    } = this.services;

    const res = await this.mainNet.findValue(url);
    if (!res) throw new Error("fail meta");

    const { peer, meta } = res;

    if (!SubNetworkManager.isExist(url)) {
      // connect to seeder via navigator

      const navigatorRes = await RpcManager.getWait<
        RPCNavigatorBackOfferBySeeder
      >(peer, RPCUserReqSeederOffer2Navigator(this.mainNet.kid, url))(
        subNetTimeout
      ).catch(() => {});
      if (!navigatorRes)
        throw new Error("connectSubNet fail RPCUserReqSeederOffer2Navigator");

      const subNet = SubNetworkManager.createNetwork(
        url,
        CreatePeer.peerCreater,
        this.mainNet.kid
      );

      const seederPeer = CreatePeer.peerCreater.create(navigatorRes.seederKid);
      const answer = await seederPeer
        .setOffer(navigatorRes.sdp)
        .catch(() => {});
      if (!answer) throw new Error("connectSubNet fail setOffer");

      peer.rpc({
        ...RPCUserAnswerSeederOverNavigator(answer),
        id: navigatorRes.id
      });

      const err = await seederPeer.onConnect
        .asPromise(subNetTimeout)
        .catch(() => "err");
      if (err) throw new Error("connectSubNet fail connect");

      subNet.addPeer(seederPeer);

      await subNet.findNode();
      SeederManager.createSeeder(url, this.mainNet, subNet, this.services);
      return { subNet, meta };
    } else {
      const subNet = SubNetworkManager.getSubNetwork(url);
      if (subNet.state.onFinding) {
        const err = await subNet.state.onFinding
          .asPromise(subNetTimeout)
          .catch(() => "err");
        if (err) throw new Error("timeout onFinding");
      }
      await subNet.findNode();

      return { subNet, meta };
    }
  };

  // Navigatorのエントリーポイントを作る
  // setupNavigator(url: string, subNet: SubNetwork) {
  //   const { SeederManager } = this.services;

  //   const seeder = SeederManager.createSeeder(
  //     url,
  //     this.mainNet,
  //     subNet,
  //     this.services
  //   );

  //   SeederContainer.setupNavigators(url);
  // }
}

const RPCUserReqSeederOffer2Navigator = (userKid: string, url: string) => ({
  type: "RPCUserReqSeederOffer2Navigator" as const,
  userKid,
  url
});

export type RPCUserReqSeederOffer2Navigator = ReturnType<
  typeof RPCUserReqSeederOffer2Navigator
>;

const RPCUserAnswerSeederOverNavigator = (sdp: Signal) => ({
  type: "RPCUserAnswerSeederOverNavigator" as const,
  sdp
});

export type RPCUserAnswerSeederOverNavigator = ReturnType<
  typeof RPCUserAnswerSeederOverNavigator
>;
