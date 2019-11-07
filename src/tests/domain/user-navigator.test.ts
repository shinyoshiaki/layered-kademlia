import Kademlia, { PeerMockModule, PeerModule } from "../../vendor/kademlia";

import { PeerCreater } from "../../sp2p/module/peerCreater";
import { SP2P } from "../../sp2p/adapter/actor";
import { testSetupNodes } from "../setupnetwork";

describe("domain/user-navigator", () => {
  const job = async (nodes: Kademlia[], PeerCreater: PeerCreater) => {
    const actors = nodes.map(v => new SP2P({ PeerCreater }, v));
    const seeder = actors.shift()!;
    const { url } = await seeder.seeder.storeStatic(
      "test",
      Buffer.from("test")
    );

    expect(
      Object.keys(seeder.services.SeederManager.list[url].navigatorPeers)
        .length > 0
    ).toBe(true);

    const user = actors.shift()!;
    await user.user.findStatic(url);

    seeder.dispose();

    await new Promise(r => setTimeout(r, 3_000));

    const finder = actors.shift()!;

    const ab = await finder.user.findStatic(url).catch(() => undefined);

    expect(Buffer.from(ab!)).toEqual(Buffer.from("test"));

    // actors.forEach(actor => actor.dispose());
    // user.dispose();
    // finder.dispose();
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(3, PeerMockModule, { timeout: 5_000 });
    await job(nodes, new PeerCreater(PeerMockModule));
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(3, PeerModule, { timeout: 5_000 });
    await job(nodes, new PeerCreater(PeerModule));
  }, 600_000);
});
