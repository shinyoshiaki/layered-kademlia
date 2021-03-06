import { InjectServices } from "../../service";
import { MainNetwork } from "../../entity/network/main";
import { Options } from "../../main";

import { RPCNavigatorBackOfferBySeeder } from "../../entity/actor/navigator";
import { SeederContainer } from "./seeder";
import { Signal } from "webrtc4me";
import { SubNetwork } from "../../entity/network/sub";
import { Peer } from "../../../vendor/kademlia";

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
    const { SubNetworkManager, CreatePeer, RpcManager } = this.services;

    const res = await this.mainNet.findValue(url);
    if (!res) throw new Error("fail meta");

    const { peer, meta } = res;

    if (SubNetworkManager.isExist(url)) {
      const subNet = SubNetworkManager.getSubNetwork(url);
      if (subNet.state.onFinding) {
        const err = await subNet.state.onFinding
          .asPromise(subNetTimeout)
          .catch(() => "err");
        if (err) throw new Error("timeout onFinding");
      }

      return { subNet, meta };
    }

    const navigatorRes = await RpcManager.getWait<
      RPCNavigatorBackOfferBySeeder
    >(
      peer,
      RPCUserReqSeederOffer2Navigator(this.mainNet.kid, url)
    )(subNetTimeout).catch(() => {});

    if (!navigatorRes) {
      console.log("timeout", "RPCUserReqSeederOffer2Navigator", peer.type);
      throw new Error("connectSubNet fail RPCUserReqSeederOffer2Navigator");
    }

    const seederPeer = CreatePeer.peerCreator.create(navigatorRes.seederKid);
    const answer = await seederPeer.setOffer(navigatorRes.sdp).catch(() => {});
    if (!answer) throw new Error("connectSubNet fail setOffer");

    peer.rpc({
      ...RPCUserAnswerSeederOverNavigator(answer),
      id: navigatorRes.id
    });

    const err = await seederPeer.onConnect
      .asPromise(subNetTimeout)
      .catch(() => "err");
    if (err) throw new Error("connectSubNet fail connect");

    const subNet = SubNetworkManager.createNetwork(
      meta,
      CreatePeer.peerCreator,
      this.mainNet.kid
    );

    subNet.addPeer(seederPeer);

    await subNet.findNode();

    // UserはSeederを兼ねる
    const seederContainer = new SeederContainer(
      this.services,
      this.mainNet,
      this.options
    );

    await seederContainer.userConnect(meta, subNet);

    return { subNet, meta };
  };

  //ユーティリティ
  async findStatic(url: string) {
    const connect = await this.connectSubNet(url).catch(() => {});
    if (!connect) {
      throw new Error("connect failed");
    }
    const { subNet } = connect;
    const res = await subNet.findStaticMetaTarget();

    return res;
  }

  //ユーティリティ
  async findStream(
    url: string,
    cb: Parameters<SubNetwork["findStreamMetaTarget"]>[0]
  ) {
    const connect = await this.connectSubNet(url).catch(() => {});
    if (!connect) {
      throw new Error("connect failed");
    }
    const { subNet, meta } = connect;
    const start = () => {
      subNet.findStreamMetaTarget(cb);
    };
    return { meta, start };
  }
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
