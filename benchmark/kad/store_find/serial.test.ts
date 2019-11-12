import { PeerMockModule } from "../../../src/vendor/kademlia";
import { testSetupNodes } from "../../../src/tests/setupnetwork";

const NODE_NUM = 50;
const log = (...s: any[]) => console.log(`kad/store_find/serial `, ...s);

test(
  "kad/store_find/serial",
  async () => {
    const start = Date.now();
    log("kad bench");

    const nodes = await testSetupNodes(NODE_NUM, PeerMockModule, {
      timeout: 10_000
    });
    log("node setup");

    const urls = await (async () => {
      const arr: string[] = [];
      for (let node of nodes) {
        const res = await node.store(node.kid).catch(() => {});
        if (res) arr.push(res.item.key);
      }
      return arr;
    })();
    log("store", urls.length);

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
    log("findvalue", values.length);

    log("kad end bench", (Date.now() - start) / 1000 + "s");
  },
  Infinity
);
