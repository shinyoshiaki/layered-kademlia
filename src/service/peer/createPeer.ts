import { Peer } from "../../vendor/kademlia/modules/peer/base";
import { PeerCreater } from "../../module/peerCreater";

export class CreatePeer {
  constructor(private modules: { PeerCreater: PeerCreater } = {} as any) {}

  async connect(url: string, myKid: string, peer: Peer) {
    const { PeerCreater } = this.modules;

    const connect = PeerCreater.create(peer.kid);

    const offer = await connect.createOffer();
    const id = Math.random().toString();
    peer.rpc(RPCCreatePeerOffer(offer, url, myKid, id));

    const { answer } = await peer
      .eventRpc<RPCCreatePeerAnswer>("RPCCreatePeerAnswer", id)
      .asPromise();

    await connect.setAnswer(answer);
    return connect;
  }

  get peerCreater() {
    return this.modules.PeerCreater;
  }
}

const RPCCreatePeerOffer = (
  offer: string,
  url: string,
  kid: string,
  id: string
) => ({
  type: "RPCCreatePeerOffer" as const,
  offer,
  kid,
  url,
  id
});

export type RPCCreatePeerOffer = ReturnType<typeof RPCCreatePeerOffer>;

export const RPCCreatePeerAnswer = (answer: string, id: string) => ({
  type: "RPCCreatePeerAnswer" as const,
  answer,
  id
});

export type RPCCreatePeerAnswer = ReturnType<typeof RPCCreatePeerAnswer>;
