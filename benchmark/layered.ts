import { PeerCreater } from "../src/sp2p/module/peerCreater";
import { PeerMockModule } from "../src/vendor/kademlia";
import { SP2P } from "../src/sp2p/adapter/actor";
import { testSetupNodes } from "../src/tests/setupnetwork";

const NODE_NUM = 400;

async function layerdKadBenchmark() {
  console.log("layerd Kad");
  const start = Date.now();
  const nodes = await testSetupNodes(NODE_NUM, PeerMockModule, {
    timeout: 10_000
  });
  const actors = nodes.map(
    node => new SP2P({ PeerCreater: new PeerCreater(PeerMockModule) }, node)
  );
  const urls = (
    await Promise.all(
      actors.map(async actor => {
        const res = await actor.seeder
          .storeStatic(actor.mainNet.kid, Buffer.from(actor.mainNet.kid))
          .catch(() => {});
        if (res) return res.url;
      })
    )
  ).filter(v => !!v) as string[];
  console.log("store", urls.length);

  const values = (
    await Promise.all(
      actors.map(async (actor, i) => {
        const res = await actor.user
          .findStatic(urls[urls.length - i - 1])
          .catch(() => {});
        if (res) return res;
      })
    )
  ).filter(v => !!v) as ArrayBuffer[];

  console.log("findvalue", values.length);

  console.log("layerd Kad end bench", (Date.now() - start) / 1000 + "s");
}

layerdKadBenchmark();
