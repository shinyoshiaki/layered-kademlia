import Kademlia from "../../vendor/kademlia";
import { PeerCreator } from "../../sp2p/module/peerCreator";
import { SP2P } from "../../sp2p/main";
import { testSetupNodes } from "../setupNetwork";
import { PeerMockModule } from "../../vendor/kademlia/modules/peer/base";
import { PeerWebRTCModule } from "../../vendor/kademlia/modules/peer/webrtc";

describe("stream/find", () => {
  const job = async (nodes: Kademlia[], PeerCreator: PeerCreator) => {
    const actors = nodes.map(node => new SP2P({ PeerCreator }, node));

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
      const { subNet } = res;
      let count = 0;
      subNet.findStreamMetaTarget(({ type, chunk }) => {
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

    actors.forEach(v => v.dispose());
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(5, PeerMockModule, { timeout: 5_000 });
    await job(nodes, new PeerCreator(PeerMockModule));
  }, 60_000_0);
  test("webRtc", async () => {
    const nodes = await testSetupNodes(5, PeerWebRTCModule, { timeout: 5_000 });
    await job(nodes, new PeerCreator(PeerWebRTCModule));
  }, 60_000_0);
});
