import { Peer, PeerModule, genKid } from "kad-rtc";

export class CreatePeer {
  async connect(url: string, peer: Peer) {
    const connect = PeerModule(genKid());

    const offer = await connect.createOffer();
    const id = Math.random().toString();
    peer.rpc(RPCCreatePeerOffer(JSON.stringify(offer), url, id));

    const { answer } = await peer
      .eventRpc<RPCCreatePeerAnswer>("RPCCreatePeerAnswer", id)
      .asPromise();

    await connect.setAnswer(JSON.parse(answer));
    return connect;
  }
}

const RPCCreatePeerOffer = (offer: string, url: string, id: string) => ({
  type: "RPCCreatePeerOffer" as const,
  offer,
  id,
  url
});

export type RPCCreatePeerOffer = ReturnType<typeof RPCCreatePeerOffer>;

export const RPCCreatePeerAnswer = (answer: string, id: string) => ({
  type: "RPCCreatePeerAnswer" as const,
  answer,
  id
});

export type RPCCreatePeerAnswer = ReturnType<typeof RPCCreatePeerAnswer>;
