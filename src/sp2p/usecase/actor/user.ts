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
    private options: Options = {}
  ) {}

  connectSubNet = async (url: string) => {
    const { SubNetworkManager, CreatePeer, RpcManager } = this.services;

    const res = await this.mainNet.findValue(url);
    if (!res) return;

    const { peer, meta } = res;

    if (!SubNetworkManager.isExist(url)) {
      // connect to seeder via navigator

      const navigatorRes = await RpcManager.getWait<
        RPCNavigatorBackOfferBySeeder
      >(peer, RPCUserReqSeederOffer2Navigator(this.mainNet.kid))().catch(
        () => {}
      );
      if (!navigatorRes) return;

      const subNet = SubNetworkManager.createNetwork(
        url,
        CreatePeer.peerCreater,
        this.mainNet.kid
      );

      const seederPeer = CreatePeer.peerCreater.create(navigatorRes.seederKid);
      const answer = await seederPeer.setOffer(navigatorRes.offer);

      peer.rpc({
        ...RPCUserAnswerSeederOverNavigator(answer),
        id: navigatorRes.id
      });

      await seederPeer.onConnect.asPromise();
      subNet.addPeer(seederPeer);

      await subNet.findNode();

      return { subNet, meta };
    } else {
      const subNet = SubNetworkManager.getSubNetwork(url);
      if (subNet.state.onFinding) {
        await subNet.state.onFinding.asPromise();
      }
      await subNet.findNode();
      return { subNet, meta };
    }
  };
}

const RPCUserReqSeederOffer2Navigator = (userKid: string) => ({
  type: "RPCUserReqSeederOffer2Navigator" as const,
  userKid
});

export type RPCUserReqSeederOffer2Navigator = ReturnType<
  typeof RPCUserReqSeederOffer2Navigator
>;

const RPCUserAnswerSeederOverNavigator = (answer: Signal) => ({
  type: "RPCUserAnswerSeederOverNavigator" as const,
  answer
});

export type RPCUserAnswerSeederOverNavigator = ReturnType<
  typeof RPCUserAnswerSeederOverNavigator
>;
