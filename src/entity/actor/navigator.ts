import { Meta, meta2URL } from "../data/meta";
import {
  RPCCreatePeerAnswer,
  RPCCreatePeerOffer
} from "../../service/peer/createPeer";

import { MainNetwork } from "../network/main";
import { SubNetwork } from "../network/sub";

export class Navigator {
  url = meta2URL(this.meta);

  constructor(private meta: Meta, mainNet: MainNetwork, subNet: SubNetwork) {
    // from user find
    mainNet.eventManager
      .selectListen<RPCCreatePeerOffer>("RPCCreatePeerOffer")
      .subscribe(async ({ rpc, peer }) => {
        const { offer, id, url } = rpc;
        if (this.url === url) {
          const seederPeer = subNet.kTable.getPeer(peer.kid);
          if (!seederPeer) return;

          seederPeer.rpc(RPCNavigatorCallAnswer(offer, url, id));

          const { answer } = await peer
            .eventRpc<RPCCreatePeerAnswer>("RPCCreatePeerAnswer", id)
            .asPromise();
          peer.rpc(RPCCreatePeerAnswer(answer, id));
        }
      });
  }
}

const RPCNavigatorCallAnswer = (offer: string, url: string, id: string) => ({
  type: "RPCNavigatorCallAnswer" as const,
  url,
  offer,
  id
});

export type RPCNavigatorCallAnswer = ReturnType<typeof RPCNavigatorCallAnswer>;
