import Kademlia, { PeerMockModule, PeerModule } from "../../vendor/kademlia";

import { PeerCreator } from "../../sp2p/module/peerCreator";
import { SP2P } from "../../sp2p/main";
import { testSetupNodes } from "../setupNetwork";

describe("domain/user-navigator", () => {
  const job = async (nodes: Kademlia[], PeerCreator: PeerCreator) => {
    const actors = nodes.map(v => new SP2P({ PeerCreator }, v));

    const seeder = actors.shift()!;
    await seeder.seeder.storeStatic("test", Buffer.from("test"));

    const navigator = actors.shift()!;
    expect(navigator.services.NavigatorManager.allNavigator.length > 0).toBe(
      true
    );

    seeder.dispose();

    await new Promise(r => setTimeout(r, 5_000));

    expect(navigator.services.NavigatorManager.allNavigator.length).toBe(0);

    // actors.forEach(actor => actor.dispose());
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
