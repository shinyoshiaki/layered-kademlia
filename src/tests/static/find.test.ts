import Kademlia, { PeerMockModule, PeerModule } from "../../vendor/kademlia";

import { PeerCreater } from "../../sp2p/module/peerCreater";
import { SP2P } from "../../sp2p/adapter/actor";
import { StaticMeta } from "../../sp2p/entity/data/meta";
import { testSetupNodes } from "../setupnetwork";

describe("static/find", () => {
  const job = async (nodes: Kademlia[], PeerCreater: PeerCreater) => {
    const actors = nodes.map(node => new SP2P({ PeerCreater }, node));

    const actorStore = actors.pop()!;

    const { url } = await actorStore.seeder.storeStatic(
      "test",
      Buffer.from("hello")
    );

    await new Promise(r => setTimeout(r));

    for (let actor of actors) {
      const res = await actor.user.connectSubNet(url).catch(() => undefined);

      expect(res).not.toBeUndefined();
      const { subNet } = res!;

      const ab = await subNet.findStaticMetaTarget();
      expect(Buffer.from(ab!)).toEqual(Buffer.from("hello"));
    }

    expect(true).toBe(true);
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(10, PeerMockModule, { timeout: 5_000 });
    await job(nodes, new PeerCreater(PeerMockModule));
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(10, PeerModule, { timeout: 5_000 });
    await job(nodes, new PeerCreater(PeerModule));
  }, 600_000);
});
