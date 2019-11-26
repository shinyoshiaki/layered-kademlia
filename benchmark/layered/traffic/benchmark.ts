import {
  PeerTrafficMockModule,
  getTrafficContextTraffic
} from "../../mock/peer/traffic";

import { PeerCreator } from "../../../src/sp2p/module/peerCreator";
import { SP2P } from "../../../src/sp2p/main";
import { testSetupNodes } from "../../../src/tests/setupNetwork";

const log = (...s: any[]) => console.log(`layered/traffic `, ...s);

export async function benchmarkLayeredTraffic(
  NODE_NUM: number,
  GROUP_NUM: number,
  KBUCKET_SIZE: number
) {
  const start = Date.now();
  const nodes = await testSetupNodes(NODE_NUM, PeerTrafficMockModule, {
    timeout: 60_000 * 60 * 24,
    kBucketSize: KBUCKET_SIZE
  });

  const actors = nodes.map(
    node =>
      new SP2P({ PeerCreator: new PeerCreator(PeerTrafficMockModule) }, node, {
        subNetTimeout: 60_000 * 60 * 24,
        kBucketSize: KBUCKET_SIZE
      })
  );

  const urls = await Promise.all(
    [...Array(GROUP_NUM)].map(async () => {
      const store = actors.shift()!;
      const res = await store.seeder
        .storeStatic(store.mainNet.kid, Buffer.from("benchmark"))
        .catch(() => {});
      if (!res) throw new Error("fail");
      return res.url;
    })
  );

  const group = nodes.length / GROUP_NUM;
  const values = (
    await Promise.all(
      actors.map(async (actor, i) => {
        const url = urls[Math.floor(i / group)];
        const res = await actor.user.findStatic(url).catch(() => {});
        if (res) return res;
      })
    )
  ).filter(v => !!v) as ArrayBuffer[];

  log("findvalue", values.length);

  log(
    "end bench",
    (Date.now() - start) / 1000 + "s",
    "traffic",
    getTrafficContextTraffic()
  );
  await new Promise(r => setTimeout(r, 1000));
}
