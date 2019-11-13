import {
  PeerTrafficMockModule,
  getTrafficContextTraffic
} from "../../mock/peer/traffic";

import { PeerCreater } from "../../../src/sp2p/module/peerCreater";
import { SP2P } from "../../../src/sp2p/adapter/actor";
import { testSetupNodes } from "../../../src/tests/setupnetwork";

const NODE_NUM = 10;
const log = (...s: any[]) => console.log(`layered/traffic `, ...s);

export async function benchmarkLayeredTraffic() {
  const start = Date.now();
  const nodes = await testSetupNodes(NODE_NUM, PeerTrafficMockModule, {
    timeout: 10_000
  });
  const actors = nodes.map(
    node =>
      new SP2P({ PeerCreater: new PeerCreater(PeerTrafficMockModule) }, node)
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

  log(
    "end bench",
    (Date.now() - start) / 1000 + "s",
    getTrafficContextTraffic()
  );
}
