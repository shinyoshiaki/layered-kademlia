import Kademlia, { PeerMockModule, PeerModule } from "../../vendor/kademlia";

import { PeerCreator } from "../../sp2p/module/peerCreator";
import { SP2P } from "../../sp2p/main";
import { testSetupNodes } from "../setupNetwork";

describe("domain/user-navigator", () => {
  const job = async (nodes: Kademlia[], PeerCreator: PeerCreator) => {
    const actors = nodes.map(v => new SP2P({ PeerCreator }, v));
    const seeder = actors.shift()!;
    const { url } = await seeder.seeder.storeStatic(
      "test",
      Buffer.from("test")
    );
    const shouldDispose: SP2P[] = [];

    expect(
      Object.keys(seeder.services.SeederManager.list[url].navigatorPeers)
        .length > 0
    ).toBe(true);

    const user = actors.shift()!;
    shouldDispose.push(user);
    await user.user.findStatic(url);

    seeder.dispose();

    await new Promise(r => setTimeout(r, 5_000));

    const finder = actors.pop()!;
    shouldDispose.push(finder);

    const ab = await finder.user.findStatic(url).catch(() => undefined);

    expect(Buffer.from(ab!)).toEqual(Buffer.from("test"));

    actors.forEach(v => v.dispose());
    shouldDispose.forEach(v => v.dispose());
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(5, PeerMockModule, { timeout: 5_000 });
    await job(nodes, new PeerCreator(PeerMockModule));
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(5, PeerModule, { timeout: 5_000 });
    await job(nodes, new PeerCreator(PeerModule));
  }, 600_000);
});
