import Kademlia, { PeerMockModule, PeerModule } from "../../vendor/kademlia";

import { SP2P } from "../../adapter/actor";
import { StaticMeta } from "../../entity/data/meta";
import { testSetupNodes } from "../setupnetwork";

describe("static/find", () => {
  const job = async (nodes: Kademlia[]) => {
    const actors = nodes.map(node => new SP2P(node));

    const actorStore = actors.pop()!;

    const { url } = await actorStore.seeder.storeStatic(
      "test",
      Buffer.from("hello")
    );

    await new Promise(r => setTimeout(r));

    await Promise.all(
      actors.map(async actor => {
        const res = await actor.user.connectSubNet(url);

        expect(res).not.toBeUndefined();
        const { subNet, meta } = res!;

        const ab = await subNet.findStaticMetaTarget(meta as StaticMeta);
        expect(Buffer.from(ab!)).toEqual(Buffer.from("hello"));
      })
    );
    expect(true).toBe(true);
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(10, PeerMockModule, { timeout: 10_000 });
    await job(nodes);
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(10, PeerModule, { timeout: 10_000 });
    await job(nodes);
  }, 600_000);
});
