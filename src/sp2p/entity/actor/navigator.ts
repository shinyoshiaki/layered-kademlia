import { Meta, meta2URL } from "../data/meta";
import { Peer, RPC } from "../../../vendor/kademlia/modules/peer/base";
import {
  RPCUserAnswerSeederOverNavigator,
  RPCUserReqSeederOffer2Navigator
} from "../../usecase/actor/user";

import { InjectServices } from "../../service";
import { MainNetwork } from "../network/main";
import { Options } from "../../adapter/actor";
import { RPCSeederOffer2UserOverNavigator } from "./seeder";
import { Signal } from "webrtc4me";

export class Navigator {
  url = meta2URL(this.meta);

  constructor(
    services: InjectServices,
    private meta: Meta,
    mainNet: MainNetwork,
    public seederPeer: Peer,
    options: Options
  ) {
    const { RpcManager, NavigatorManager } = services;
    const { subNetTimeout } = options;

    // from user find
    const { unSubscribe } = mainNet.eventManager
      .selectListen<RPCUserReqSeederOffer2Navigator & RPC>(
        "RPCUserReqSeederOffer2Navigator"
      )
      .subscribe(async ({ rpc, peer }) => {
        if (rpc.url === this.url) {
          const seederRes = await RpcManager.getWait<
            RPCSeederOffer2UserOverNavigator
          >(seederPeer, RPCNavigatorReqSeederOfferByUser(rpc.userKid))(
            subNetTimeout
          ).catch(() => {});
          if (!seederRes)
            throw new Error("navigator fail RPCNavigatorReqSeederOfferByUser");

          //for user
          const userRes = await RpcManager.getWait<
            RPCUserAnswerSeederOverNavigator
          >(
            peer,
            RPCNavigatorBackOfferBySeeder(seederRes.sdp, seederPeer.kid),
            rpc.id
          )(subNetTimeout).catch(() => {});
          if (!userRes)
            throw new Error("navigator fail RPCNavigatorBackOfferBySeeder");

          //for seeder
          seederPeer.rpc({
            ...RPCNavigatorBackAnswerByUser(userRes.sdp),
            id: seederRes.id
          });
        }
      });

    seederPeer.onDisconnect.once(() => {
      unSubscribe();
      this.seederPeer = null as any;
      NavigatorManager.deleteNavigator(this.url);
    });
  }
}

const RPCNavigatorReqSeederOfferByUser = (userKid: string) => ({
  type: "RPCNavigatorReqSeederOfferByUser" as const,
  userKid
});

export type RPCNavigatorReqSeederOfferByUser = ReturnType<
  typeof RPCNavigatorReqSeederOfferByUser
>;

export const RPCNavigatorBackOfferBySeeder = (
  sdp: Signal,
  seederKid: string
) => ({
  type: "RPCNavigatorBackOfferBySeeder" as const,
  sdp,
  seederKid
});

export type RPCNavigatorBackOfferBySeeder = ReturnType<
  typeof RPCNavigatorBackOfferBySeeder
>;

const RPCNavigatorBackAnswerByUser = (sdp: Signal) => ({
  type: "RPCNavigatorBackAnswerByUser" as const,
  sdp
});

export type RPCNavigatorBackAnswerByUser = ReturnType<
  typeof RPCNavigatorBackAnswerByUser
>;
