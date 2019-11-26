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
import { Options } from "../../adapter/actor";
import { Peer } from "../../../vendor/kademlia";
import { RPC } from "../../../vendor/kademlia/modules/peer/base";
import { Signal } from "webrtc4me";
import { SubNetwork } from "../network/sub";
import sha1 from "sha1";

export class Seeder {
  navigatorPeers: { [kid: string]: Peer } = {};
  onCreatePeerOffer = new Event<string>();

  onNavigatorCallAnswer = new Event<string>();

  constructor(
    private services: InjectServices,
    url: string,
    mainNet: MainNetwork,
    private subNet: SubNetwork,
    private options: Options
  ) {
    const { CreatePeer, RpcManager } = services;
    const { subNetTimeout } = options;

    mainNet.eventManager
      .selectListen<RPCUserReqSeederOffer2Navigator & RPC>(
        "RPCUserReqSeederOffer2Navigator"
      )
      .subscribe(async ({ rpc, peer }) => {
        if (url === rpc.url) {
          //emulate navigator behave
          const userPeer = CreatePeer.peerCreator.create(rpc.userKid);
          const offer = await userPeer.createOffer();
          const res = await RpcManager.getWait<
            RPCUserAnswerSeederOverNavigator
          >(
            peer,
            RPCNavigatorBackOfferBySeeder(offer, mainNet.kid),
            rpc.id
          )(subNetTimeout).catch(() => {});
          if (!res) {
            console.log("timeout");
            return;
          }
          await userPeer.setAnswer(res.sdp);
          this.subNet.addPeer(userPeer);
        }
      });
  }

  addNavigatorPeer(navigatorPeer: Peer) {
    const { RpcManager, CreatePeer } = this.services;
    const { subNetTimeout } = this.options;

    this.navigatorPeers[navigatorPeer.kid] = navigatorPeer;

    const { unSubscribe } = RpcManager.asObservable<
      RPCNavigatorReqSeederOfferByUser
    >("RPCNavigatorReqSeederOfferByUser", navigatorPeer).subscribe(
      async rpc => {
        const userPeer = CreatePeer.peerCreator.create(rpc.userKid);
        const offer = await userPeer.createOffer();

        const res = await RpcManager.getWait<RPCNavigatorBackAnswerByUser>(
          navigatorPeer,
          RPCSeederOffer2UserOverNavigator(offer),
          rpc.id
        )(subNetTimeout).catch(() => {});

        if (!res) {
          console.log("timeout");
          return;
        }

        await userPeer.setAnswer(res.sdp);
        this.subNet.addPeer(userPeer);
      }
    );

    navigatorPeer.onDisconnect.once(() => {
      unSubscribe();
      delete this.navigatorPeers[navigatorPeer.kid];
    });
  }

  setAsset(ab: ArrayBuffer) {
    this.subNet.store(ab); // 他のノードはまだいないので通信はされない
  }

  setChunk(ab: ArrayBuffer, nextAb?: ArrayBuffer) {
    if (nextAb) {
      const next = sha1(Buffer.from(nextAb)).toString();
      this.subNet.store(ab, JSON.stringify({ type: "chunk", next }));
    } else {
      this.subNet.store(ab, JSON.stringify({ type: "chunk", next: "end" }));
    }
  }
}

const RPCSeederOffer2UserOverNavigator = (sdp: Signal) => ({
  type: "RPCSeederOffer2UserOverNavigator" as const,
  sdp
});

export type RPCSeederOffer2UserOverNavigator = ReturnType<
  typeof RPCSeederOffer2UserOverNavigator
>;
