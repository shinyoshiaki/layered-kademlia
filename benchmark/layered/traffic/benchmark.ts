import {
  PeerTrafficMockModule,
  getTrafficContextTraffic
} from "../../mock/peer/traffic";

import { PeerCreator } from "../../../src/sp2p/module/peerCreator";
import { SP2P } from "../../../src/sp2p/adapter/actor";
import { testSetupNodes } from "../../../src/tests/setupNetwork";

const log = (...s: any[]) => console.log(`layered/traffic `, ...s);

export async function benchmarkLayeredTraffic(NODE_NUM: number) {
  log("start");
  const start = Date.now();
  const nodes = await testSetupNodes(NODE_NUM, PeerTrafficMockModule, {
    timeout: 60_000 * 60 * 24,
    kBucketSize: 20
  });
  console.log("node setup done", nodes.length);

  const actors = nodes.map(
    node =>
      new SP2P({ PeerCreator: new PeerCreator(PeerTrafficMockModule) }, node, {
        subNetTimeout: 1_000 * NODE_NUM,
        kBucketSize: 20
      })
  );

  const divide = 3;

  const urls = await Promise.all(
    [...Array(divide)].map(async (_, i) => {
      const store = actors.shift()!;
      const res = await store.seeder
        .storeStatic(store.mainNet.kid, Buffer.from("value"))
        .catch(() => {});
      if (!res) throw new Error("fail");
      return res.url;
    })
  );

  const values = (
    await Promise.all(
      actors.map(async (actor, i) => {
        const url = urls[Math.floor(i / divide)];
        const res = await actor.user.findStatic(url).catch(() => {});
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
  await new Promise(r => setTimeout(r, 1000));
}
