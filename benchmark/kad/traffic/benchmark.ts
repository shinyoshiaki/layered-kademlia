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
    timeout: 10_000
  });

  const urls = (
    await Promise.all(
      nodes.map(async node => {
        const res = await node.store(node.kid).catch(() => {});
        if (res) return res.item.key;
      })
    )
  ).filter(v => !!v) as string[];
  log("store", urls.length);

  const values = (
    await Promise.all(
      nodes.map(async (node, i) => {
        const res = await node
          .findValue(urls[urls.length - i - 1])
          .catch(() => {});
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
