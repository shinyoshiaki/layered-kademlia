import Kademlia, { PeerMockModule, PeerModule } from "../../vendor/kademlia";

import { PeerCreater } from "../../sp2p/module/peerCreater";
import { SP2P } from "../../sp2p/adapter/actor";
import { StreamMeta } from "../../sp2p/entity/data/meta";
import { testSetupNodes } from "../setupnetwork";

describe("stream/find", () => {
  const job = async (nodes: Kademlia[], PeerCreater: PeerCreater) => {
    const actors = nodes.map(node => new SP2P({ PeerCreater }, node));

    let count = 0;
    const { url, event } = await actors[0].seeder.storeStream(
      "test",
      Buffer.from(`hello${count++}`),
      { cycle: 0 }
    );
    const interval = setInterval(() => {
      event.execute(Buffer.from(`hello${count++}`));
      if (count > 10) {
        event.execute(undefined);
        clearInterval(interval);
      }
    }, 1);

    const res = await new Promise<boolean>(async r => {
      const res = await actors[actors.length - 1].user
        .connectSubNet(url)
        .catch(console.warn);
      if (!res) {
        r(false);
        return;
      }
      const { subNet, meta } = res;
      let count = 0;
      subNet.findStreamMetaTarget(meta as StreamMeta, ({ type, chunk }) => {
        expect(type).not.toBe("error");

        if (type === "complete") {
          r(true);
          return;
        }

        const receive = Buffer.from(chunk!).toString();
        const target = Buffer.from(`hello${count++}`).toString();
        expect(receive).toEqual(target);
      });
    });
    expect(res).toBe(true);

    // actors.forEach(actor => actor.dispose());
  };
  test("mock", async () => {
    const nodes = await testSetupNodes(10, PeerMockModule, { timeout: 5_000 });
    await job(nodes, new PeerCreater(PeerMockModule));
  }, 60_000_0);
  // test("webrtc", async () => {
  //   const nodes = await testSetupNodes(10, PeerModule, { timeout: 5_000 });
  //   await job(nodes, new PeerCreater(PeerModule));
  // }, 60_000_0);
});
