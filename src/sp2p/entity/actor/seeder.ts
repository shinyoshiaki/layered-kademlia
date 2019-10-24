import {
  RPCNavigatorBackAnswerByUser,
  RPCNavigatorBackOfferBySeeder,
  RPCNavigatorReqSeederOfferByUser
} from "./navigator";
import {
  RPCUserAnswerSeederOverNavigator,
  RPCUserReqSeederOffer2Navigator
} from "../../usecase/actor/user";

import Event from "rx.mini";
import { InjectServices } from "../../service";
import { MainNetwork } from "../network/main";
import { Peer } from "../../../vendor/kademlia";
import { RPC } from "../../../vendor/kademlia/modules/peer/base";
import { Signal } from "webrtc4me";
import { SubNetwork } from "../network/sub";
import sha1 from "sha1";

export class Seeder {
  navigators: { [kid: string]: Peer } = {};
  onCreatePeerOffer = new Event<string>();

  onNavigatorCallAnswer = new Event<string>();

  constructor(
    private services: InjectServices,
    private url: string,
    mainNet: MainNetwork,
    private subNet: SubNetwork
  ) {
    const { CreatePeer, RpcManager } = services;

    mainNet.eventManager
      .selectListen<RPCUserReqSeederOffer2Navigator & RPC>(
        "RPCUserReqSeederOffer2Navigator"
      )
      .subscribe(async ({ rpc, peer }) => {
        //emulate navigator behave
        const userPeer = CreatePeer.peerCreater.create(rpc.userKid);
        const offer = await userPeer.createOffer();
        const res = await RpcManager.getWait<RPCUserAnswerSeederOverNavigator>(
          peer,
          RPCNavigatorBackOfferBySeeder(offer, mainNet.kid),
          rpc.id
        )().catch(() => {});
        if (!res) return;
        await userPeer.setAnswer(res.answer);
        this.subNet.addPeer(userPeer);
      });
  }

  addNavigatorPeer(peer: Peer) {
    const { RpcManager, CreatePeer } = this.services;
    this.navigators[peer.kid] = peer;
    RpcManager.asObservable<RPCNavigatorReqSeederOfferByUser>(
      "RPCNavigatorReqSeederOfferByUser",
      peer
    ).subscribe(async rpc => {
      const userPeer = CreatePeer.peerCreater.create(rpc.userKid);
      const offer = await userPeer.createOffer();
      const res = await RpcManager.getWait<RPCNavigatorBackAnswerByUser>(
        peer,
        RPCSeederOffer2UserOverNavigator(offer),
        rpc.id
      )().catch(() => {});
      if (!res) return;

      await userPeer.setAnswer(res.answer);
      this.subNet.addPeer(userPeer);
    });
  }

  setAsset(ab: ArrayBuffer) {
    const { kvs } = this.subNet;

    const key = sha1(Buffer.from(ab)).toString();
    kvs.set(key, ab, "");
  }

  setChunk(ab: ArrayBuffer, nextAb?: ArrayBuffer) {
    const { kvs } = this.subNet;

    const key = sha1(Buffer.from(ab)).toString();
    if (nextAb) {
      const next = sha1(Buffer.from(nextAb)).toString();
      kvs.set(key, ab, JSON.stringify({ type: "chunk", next }));
    } else {
      kvs.set(key, ab, JSON.stringify({ type: "chunk", next: "end" }));
    }
  }
}

const RPCSeederOffer2UserOverNavigator = (offer: Signal) => ({
  type: "RPCSeederOffer2UserOverNavigator" as const,
  offer
});

export type RPCSeederOffer2UserOverNavigator = ReturnType<
  typeof RPCSeederOffer2UserOverNavigator
>;
