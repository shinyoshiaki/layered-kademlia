import {
  RPCCreatePeerAnswer,
  RPCCreatePeerOffer
} from "../../service/peer/createPeer";

import Event from "rx.mini";
import { MainNetwork } from "../network/main";
import { Peer } from "../../vendor/kademlia/modules/peer/base";
import PeerModule from "../../vendor/kademlia/modules/peer";
import { RPCNavigatorCallAnswer } from "./navigator";
import { SubNetwork } from "../network/sub";
import sha1 from "sha1";

export class Seeder {
  onCreatePeerOffer = new Event<string>();

  onNavigatorCallAnswer = new Event<string>();

  constructor(
    private url: string,
    mainNet: MainNetwork,
    private subNet: SubNetwork
  ) {
    mainNet.eventManager
      .selectListen<RPCCreatePeerOffer>("RPCCreatePeerOffer")
      .subscribe(async ({ rpc, peer }) => {
        const { offer, id, url } = rpc;
        if (this.url === url) {
          await this.connectPeer(offer, id, peer);
          this.onCreatePeerOffer.execute(peer.kid);
        }
      });
    mainNet.eventManager
      .selectListen<RPCNavigatorCallAnswer>("RPCNavigatorCallAnswer")
      .subscribe(async ({ rpc, peer }) => {
        const { offer, id, url } = rpc;
        if (this.url === url) {
          await this.connectPeer(offer, id, peer);
          // todo : handle
        }
      });
  }

  private async connectPeer(offer: string, id: string, peer: Peer) {
    const connect = PeerModule(peer.kid);
    const answer = await connect.setOffer(JSON.parse(offer));
    peer.rpc(RPCCreatePeerAnswer(JSON.stringify(answer), id));
    await connect.onConnect.asPromise();
    this.subNet.addPeer(connect);
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
