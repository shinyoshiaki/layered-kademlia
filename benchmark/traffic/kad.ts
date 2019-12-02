import {
  PeerTrafficMockModule,
  getTrafficContextTraffic
} from "../mock/peer/traffic";

import { testSetupNodes } from "../../src/tests/setupNetwork";

const log = (...s: any[]) => console.log(`kad/traffic `, ...s);

export const benchmarkKadTraffic = async (
  NODE_NUM: number,
  GROUP_NUM: number,
  KBUCKET_SIZE: number
) => {
  const start = Date.now();
  const nodes = await testSetupNodes(NODE_NUM, PeerTrafficMockModule, {
    timeout: 60_000 * 60 * 24,
    kBucketSize: KBUCKET_SIZE
  });

  const urls = await Promise.all(
    [...Array(GROUP_NUM)].map(async () => {
      const store = nodes.shift()!;
      const res = await store.store(Buffer.from("benchmark")).catch(() => {});
      if (!res) throw new Error("fail");
      const url = res.item.key;
      return url;
    })
  );

  const group = nodes.length / GROUP_NUM;
  const values = (
    await Promise.all(
      nodes.map(async (node, i) => {
        const url = urls[Math.floor(i / group)];
        const res = await node.findValue(url).catch(() => {});
        if (res) return res.item.value;
      })
    )
  ).filter(v => !!v);
  log("findvalue", values.length);

  log(
    "end bench",
    (Date.now() - start) / 1000 + "s",
    "traffic",
    getTrafficContextTraffic()
  );
};
