import Kademlia, { PeerModule } from "../../vendor/kademlia";

import { PeerCreater } from "../../sp2p/module/peerCreater";
import { SP2P } from "../../sp2p/adapter/actor";
import { testSetupNodes } from "../setupnetwork";

describe("domain/user-navigator", () => {
  const job = async (nodes: Kademlia[], PeerCreater: PeerCreater) => {
    const actors = nodes.map(v => new SP2P({ PeerCreater }, v));

    const seeder = actors.shift()!;
    await seeder.seeder.storeStatic("test", Buffer.from("test"));

    const navigator = actors.shift()!;
    expect(navigator.services.NavigatorManager.allNavigator.length > 0).toBe(
      true
    );

    seeder.dispose();

    await new Promise(r => setTimeout(r, 1_000));

    expect(navigator.services.NavigatorManager.allNavigator.length).toBe(0);
  };

  test("webrtc", async () => {
    const nodes = await testSetupNodes(5, PeerModule, { timeout: 5_000 });
    await job(nodes, new PeerCreater(PeerModule));
  }, 600_000);
});
