import { PeerTrafficMockModule } from "../../mock/peer/traffic";
import { testSetupNodes } from "../../../src/tests/setupnetwork";

const NODE_NUM = 10;
const log = (...s: any[]) => console.log(`kad/store_find/parallel `, ...s);

export const benchmarkKadTraffic = async () => {
  const start = Date.now();
  log("kad bench");

  const nodes = await testSetupNodes(NODE_NUM, PeerTrafficMockModule, {
    timeout: 10_000
  });
  log("node setup");

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

  log("kad end bench", (Date.now() - start) / 1000 + "s");
};
