import {
  FindNodeProxyAnswerError,
  FindNodeProxyOffer,
  Offer
} from "./listen/node";

import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
import { Signal } from "webrtc4me";
import { listeners } from "../../listeners";

export default async function findNode(
  searchKid: string,
  di: DependencyInjection
) {
  const connected: Peer[] = [];
  const { kTable, rpcManager, signaling } = di;
  const { timeout } = di.opt;

  if (kTable.getPeer(searchKid)) return [kTable.getPeer(searchKid)!];

  const findNodeProxyOfferResult = await Promise.all(
    kTable.findNode(searchKid).map(async peer => {
      const except = kTable.allPeers.map(item => item.kid);

      const res = await rpcManager
        .getWait<FindNodeProxyOffer>(
          peer,
          FindNode(searchKid, except)
        )(timeout)
        .catch(() => {});

      if (res) {
        const { peers } = res;
        if (peers.length > 0) return { peers, peer };
      }
      return { peers: [], peer };
    })
  );

  const findNodeAnswer = async (node: Peer, offer: Offer) => {
    const { peerkid, sdp } = offer;
    const { peer, candidate } = signaling.create(peerkid);
    const _createAnswer = async (peer: Peer) => {
      const answer = await peer.setOffer(sdp);

      rpcManager
        .asObservable<FindNodeProxyAnswerError>(
          "FindNodeProxyAnswerError",
          node
        )
        .once(() => {
          peer.onConnect.error("FindNodeProxyAnswerError");
        });

      rpcManager.run(node, FindNodeAnswer(answer, peerkid));

      const err = await peer.onConnect.asPromise(timeout).catch(e => {
        return "err";
      });
      if (err) {
        signaling.delete(peerkid);
      } else {
        listeners(peer, di);
        connected.push(peer);
      }
    };
    if (peer) {
      await _createAnswer(peer);
    } else if (candidate) {
      const { peer, event } = candidate;
      // node.ts側でタイミング悪くPeerを作ってしまった場合の処理
      // (並行テスト時にしか起きないと思う)
      if (peer.OfferAnswer === "offer") {
        await _createAnswer(peer);
      } else {
        await event.asPromise(timeout).catch(() => {});
      }
    }
    // 相手側のlistenが完了するまで待つ
    // TODO : ちゃんと実装する
    await new Promise(r => setTimeout(r, 100));
  };

  await Promise.all(
    findNodeProxyOfferResult
      .map(item => item.peers.map(offer => findNodeAnswer(item.peer, offer)))
      .flatMap(v => v)
  );

  return connected;
}

const FindNode = (searchKid: string, except: string[]) => ({
  type: "FindNode" as const,
  searchkid: searchKid,
  except
});

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: Signal, peerKid: string) => ({
  type: "FindNodeAnswer" as const,
  sdp,
  peerkid: peerKid
});

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
