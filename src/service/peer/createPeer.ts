import { Peer } from "../../vendor/kademlia/modules/peer/base";
import PeerModule from "../../vendor/kademlia/modules/peer";

export class CreatePeer {
  async connect(url: string, myKid: string, peer: Peer) {
    const connect = PeerModule(peer.kid);

    const offer = await connect.createOffer();
    const id = Math.random().toString();
    peer.rpc(RPCCreatePeerOffer(JSON.stringify(offer), url, myKid, id));

    // todo : handle timeout
    const { answer } = await peer
      .eventRpc<RPCCreatePeerAnswer>("RPCCreatePeerAnswer", id)
      .asPromise();
    console.log({ answer });
    await connect.setAnswer(JSON.parse(answer));
    return connect;
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
