import { PeerCreator } from "../../../src/sp2p/module/peerCreator";
import { PeerMockModule } from "../../../src/vendor/kademlia";
import { SP2P } from "../../../src/sp2p/main";
import { testSetupNodes } from "../../../src/tests/setupNetwork";

const NODE_NUM = 50;
const log = (...s: any[]) => console.log(`layered/store_find `, ...s);

test(
  "layered/store_find",
  async () => {
    console.log("layered Kad");
    const start = Date.now();
    const nodes = await testSetupNodes(NODE_NUM, PeerMockModule, {
      timeout: 10_000
    });
    const actors = nodes.map(
      node => new SP2P({ PeerCreator: new PeerCreator(PeerMockModule) }, node)
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
    log("store", urls.length);

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

    log("findvalue", values.length);

    log("layerd Kad end bench", (Date.now() - start) / 1000 + "s");
  },
  60_000 * 120
);
