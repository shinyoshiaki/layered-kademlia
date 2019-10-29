import { Peer } from "../../../vendor/kademlia/modules/peer/base";
import { PeerCreater } from "../../module/peerCreater";
import { Signal } from "webrtc4me";

export class CreatePeer {
  constructor(private modules: { PeerCreater: PeerCreater } = {} as any) {}

  async connect(url: string, myKid: string, peer: Peer) {
    const { PeerCreater } = this.modules;

    const connect = PeerCreater.create(peer.kid);

    const offer = await connect.createOffer();
    const id = Math.random().toString();
    peer.rpc(RPCCreatePeerOffer(offer, url, myKid, id));

    const { sdp } = await peer
      .eventRpc<RPCCreatePeerAnswer>("RPCCreatePeerAnswer", id)
      .asPromise();

    await connect.setAnswer(sdp);
    return connect;
  }

  get peerCreater() {
    return this.modules.PeerCreater;
  }
}

const RPCCreatePeerOffer = (
  sdp: Signal,
  url: string,
  kid: string,
  id: string
) => ({
  type: "RPCCreatePeerOffer" as const,
  sdp,
  kid,
  url,
  id
});

export type RPCCreatePeerOffer = ReturnType<typeof RPCCreatePeerOffer>;

export const RPCCreatePeerAnswer = (sdp: Signal, id: string) => ({
  type: "RPCCreatePeerAnswer" as const,
  sdp,
  id
});

export type RPCCreatePeerAnswer = ReturnType<typeof RPCCreatePeerAnswer>;
