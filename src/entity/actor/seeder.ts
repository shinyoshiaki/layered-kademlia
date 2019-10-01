import { EventManager, Peer, PeerModule, genKid } from "kad-rtc";
import {
  RPCCreatePeerAnswer,
  RPCCreatePeerOffer
} from "../../service/peer/createPeer";

import { MainNetwork } from "../network/main";
import { RPCNavigatorCallAnswer } from "./navigator";
import { SubNetwork } from "../network/sub";
import sha1 from "sha1";

export class Seeder {
  constructor(
    private url: string,
    mainNet: MainNetwork,
    private subNet: SubNetwork
  ) {
    this.listen(mainNet.eventManager);
  }

  private listen(eventManager: EventManager) {
    {
      const event = eventManager.selectListen<RPCCreatePeerOffer>(
        "RPCCreatePeerOffer"
      );
      event.subscribe(async ({ rpc, peer }) => {
        const { offer, id, url } = rpc;
        if (this.url === url) {
          await this.connectPeer(offer, id, peer);
        }
      });
    }
    {
      const event = eventManager.selectListen<RPCNavigatorCallAnswer>(
        "RPCNavigatorCallAnswer"
      );
      event.subscribe(async ({ rpc, peer }) => {
        const { offer, id, url } = rpc;
        if (this.url === url) {
          await this.connectPeer(offer, id, peer);
        }
      });
    }
  }

  private async connectPeer(offer: string, id: string, peer: Peer) {
    const connect = PeerModule(genKid());
    const answer = await connect.setOffer(JSON.parse(offer));
    peer.rpc(RPCCreatePeerAnswer(JSON.stringify(answer), id));
    await peer.onConnect.asPromise();
  }

  setAsset(ab: ArrayBuffer) {
    const { kvs } = this.subNet;

    const key = sha1(new Buffer(ab)).toString();
    kvs.set(key, ab, "");
  }

  async store(ab: ArrayBuffer) {
    const { store } = this.subNet;

    const key = sha1(new Buffer(ab)).toString();
    await store(key, ab);
  }

  getPeers() {
    return this.subNet.allPeers;
  }
}
