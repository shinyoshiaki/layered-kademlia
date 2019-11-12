import { PeerMockModule } from "../src/vendor/kademlia";
import { testSetupNodes } from "../src/tests/setupnetwork";

const NODE_NUM = 50;

async function kadBenchmark() {
  const start = Date.now();
  console.log("kad bench");

  const nodes = await testSetupNodes(NODE_NUM, PeerMockModule, {
    timeout: 10_000
  });
  console.log("node setup");

  const urls = await (async () => {
    const arr: string[] = [];
    for (let node of nodes) {
      const res = await node.store(node.kid).catch(() => {});
      if (res) arr.push(res.item.key);
    }
    return arr;
  })();
  console.log("store", urls.length);

  const values = await (async () => {
    let arr: any[] = [],
      i = 0;
    for (let node of nodes) {
      const res = await node
        .findValue(urls[urls.length - i - 1])
        .catch(() => {});
      if (res) arr.push(res.item.value);
      i++;
    }
    return arr;
  })();
  console.log("findvalue", values.length);

  console.log("kad end bench", (Date.now() - start) / 1000 + "s");
}

kadBenchmark();
