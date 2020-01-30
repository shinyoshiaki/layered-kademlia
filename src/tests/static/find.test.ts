import Kademlia from "../../vendor/kademlia";

import { PeerCreator } from "../../sp2p/module/peerCreator";
import { SP2P } from "../../sp2p/main";
import { testSetupNodes } from "../setupNetwork";
import { PeerMockModule } from "../../vendor/kademlia/modules/peer/base";
import { PeerWebRTCModule } from "../../vendor/kademlia/modules/peer/webrtc";

describe("static/find", () => {
  const job = async (nodes: Kademlia[], PeerCreator: PeerCreator) => {
    const actors = nodes.map(node => new SP2P({ PeerCreator }, node));

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

    actors.forEach(v => v.dispose());
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(5, PeerMockModule, { timeout: 5_000 });
    await job(nodes, new PeerCreator(PeerMockModule));
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(5, PeerWebRTCModule, { timeout: 5_000 });
    await job(nodes, new PeerCreator(PeerWebRTCModule));
  }, 600_000);
});
