import { PeerMockModule } from "../src/vendor/kademlia";
import { testSetupNodes } from "../src/tests/setupnetwork";

const NODE_NUM = 100;

async function kadBenchmark() {
  const start = Date.now();
  console.log("kad bench");

  const nodes = await testSetupNodes(NODE_NUM, PeerMockModule, {
    timeout: 10_000
  });
  console.log("node setup");

  const urls = (
    await Promise.all(
      nodes.map(async node => {
        const res = await node.store(node.kid).catch(() => {});
        if (res) return res.item.key;
      })
    )
  ).filter(v => !!v) as string[];
  console.log("store", urls.length);

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
  console.log("findvalue", values.length);

  console.log("kad end bench", (Date.now() - start) / 1000 + "s");
}

kadBenchmark();
