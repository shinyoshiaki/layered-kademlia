import { Peer, PeerModule } from "../../vendor/kademlia";
import {
  RPCCreatePeerAnswer,
  RPCCreatePeerOffer
} from "../../service/peer/createPeer";

import Event from "rx.mini";
import { MainNetwork } from "../network/main";
import { RPCNavigatorCallAnswer } from "./navigator";
import { SubNetwork } from "../network/sub";
import sha1 from "sha1";

export class Seeder {
  private onCreatePeerOffer = new Event<string>();
  onNewNavigatorConnect = this.onCreatePeerOffer.returnListener;

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
        console.log({ offer, id, url });
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
    await this.subNet.addPeer(connect);
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

  async store(ab: ArrayBuffer) {
    const { store } = this.subNet;

    await store(ab);
  }

  getCloseEst(kid: string): Peer | undefined {
    return this.subNet.kTable.findNode(kid)[0];
  }
}
