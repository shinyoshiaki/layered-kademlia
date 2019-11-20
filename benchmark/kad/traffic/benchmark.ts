import {
  PeerTrafficMockModule,
  getTrafficContextTraffic
} from "../../mock/peer/traffic";

import { testSetupNodes } from "../../../src/tests/setupNetwork";

const log = (...s: any[]) => console.log(`kad/traffic `, ...s);

export const benchmarkKadTraffic = async (NODE_NUM: number) => {
  log("start");
  const start = Date.now();
  const nodes = await testSetupNodes(NODE_NUM, PeerTrafficMockModule, {
    timeout: 60_000 * 60 * 24,
    kBucketSize: 8
  });

  const store = nodes.pop()!;
  const res = await store.store(Buffer.from("value")).catch(() => {});
  if (!res) throw new Error("");
  const url = res.item.key;

  await new Promise(r => setTimeout(r, 5000));

  const values = (
    await Promise.all(
      nodes.map(async node => {
        const res = await node.findValue(url).catch(() => {});
        if (res) return res.item.value;
      })
    )
  ).filter(v => !!v);
  log("findvalue", values.length);

  log(
    "end bench",
    (Date.now() - start) / 1000 + "s",
    getTrafficContextTraffic()
  );
};
