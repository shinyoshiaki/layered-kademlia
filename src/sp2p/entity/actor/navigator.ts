import { Meta, meta2URL } from "../data/meta";
import { Peer, RPC } from "../../../vendor/kademlia/modules/peer/base";
import {
  RPCUserAnswerSeederOverNavigator,
  RPCUserReqSeederOffer2Navigator
} from "../../usecase/actor/user";

import { InjectServices } from "../../service";
import { MainNetwork } from "../network/main";
import { RPCSeederOffer2UserOverNavigator } from "./seeder";
import { Signal } from "webrtc4me";

export class Navigator {
  url = meta2URL(this.meta);

  constructor(
    services: InjectServices,
    private meta: Meta,
    mainNet: MainNetwork,
    seederPeer: Peer
  ) {
    const { RpcManager } = services;
    // from user find
    mainNet.eventManager
      .selectListen<RPCUserReqSeederOffer2Navigator & RPC>(
        "RPCUserReqSeederOffer2Navigator"
      )
      .subscribe(async ({ rpc, peer }) => {
        const seederRes = await RpcManager.getWait<
          RPCSeederOffer2UserOverNavigator
        >(seederPeer, RPCNavigatorReqSeederOfferByUser(rpc.userKid))().catch(
          () => {}
        );
        if (!seederRes) return;

        //for user
        const userRes = await RpcManager.getWait<
          RPCUserAnswerSeederOverNavigator
        >(
          peer,
          RPCNavigatorBackOfferBySeeder(seederRes.offer, seederPeer.kid),
          rpc.id
        )().catch(() => {});
        if (!userRes) return;

        //for seeder
        seederPeer.rpc({
          ...RPCNavigatorBackAnswerByUser(userRes.answer),
          id: seederRes.id
        });
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
  offer: Signal,
  seederKid: string
) => ({
  type: "RPCNavigatorBackOfferBySeeder" as const,
  offer,
  seederKid
});

export type RPCNavigatorBackOfferBySeeder = ReturnType<
  typeof RPCNavigatorBackOfferBySeeder
>;

const RPCNavigatorBackAnswerByUser = (answer: Signal) => ({
  type: "RPCNavigatorBackAnswerByUser" as const,
  answer
});

export type RPCNavigatorBackAnswerByUser = ReturnType<
  typeof RPCNavigatorBackAnswerByUser
>;
