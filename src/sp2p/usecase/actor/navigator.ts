import {
  RPCSeederAnswer2Navigator,
  RPCSeederNavigatorCandidate
} from "./seeder";

import { InjectServices } from "../../service";
import { MainNetwork } from "../../entity/network/main";
import { Meta } from "../../entity/data/meta";
import { Options } from "../../main";
import { RPC } from "../../../vendor/kademlia/modules/peer/base";
import { Signal } from "webrtc4me";

export class NavigatorContainer {
  constructor(
    services: InjectServices,
    mainNet: MainNetwork,
    options: Options
  ) {
    const { subNetTimeout } = options;
    const { CreatePeer, NavigatorManager, RpcManager } = services;

    mainNet.eventManager
      .selectListen<RPCSeederNavigatorCandidate & RPC>(
        "RPCSeederNavigatorCandidate"
      )
      .subscribe(async ({ rpc, peer }) => {
        const { metaStr, targetId, id } = rpc;
        if (targetId === mainNet.kid) {
          const meta: Meta = JSON.parse(metaStr);

          const seederPeer = CreatePeer.peerCreator.create(peer.kid);
          const offer = await seederPeer.createOffer();
          const res = await RpcManager.getWait<RPCSeederAnswer2Navigator>(
            peer,
            RPCNavigatorCandidateOffer2Seeder(offer),
            id,
            "RPCSeederAnswer2Navigator"
          )(subNetTimeout).catch(() => {});

          if (!res) {
            console.log("timeout");
            return;
          }

          await seederPeer.setAnswer(res.sdp);

          NavigatorManager.createNavigator(meta, mainNet, seederPeer);
        }
      });
  }
}

const RPCNavigatorCandidateOffer2Seeder = (sdp: Signal) => ({
  type: "RPCNavigatorCandidateOffer2Seeder" as const,
  sdp
});

export type RPCNavigatorCandidateOffer2Seeder = ReturnType<
  typeof RPCNavigatorCandidateOffer2Seeder
>;
