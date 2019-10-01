import Kademlia from "../vendor/kademlia";
import PeerModule from "../vendor/kademlia/modules/peer";
import { genKad } from "../entity/network/util";

const kBucketSize = 8;

export async function testSetupNodes(num: number) {
  const nodes: Kademlia[] = [];

  for (let i = 0; i < num; i++) {
    if (nodes.length === 0) {
      const node = genKad({ kBucketSize });
      nodes.push(node);
    } else {
      const pre = nodes.slice(-1)[0];
      const push = genKad({ kBucketSize });

      const pushOffer = PeerModule(pre.di.kTable.kid);
      const offerSdp = await pushOffer.createOffer();
      const preAnswer = PeerModule(push.di.kTable.kid);
      const answerSdp = await preAnswer.setOffer(offerSdp);
      await pushOffer.setAnswer(answerSdp);

      push.add(pushOffer);
      pre.add(preAnswer);

      nodes.push(push);
    }
  }

  for (let node of nodes) {
    await node.findNode(node.kid);
  }
  return nodes;
}
