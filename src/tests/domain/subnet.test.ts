import { PeerCreator } from "../../sp2p/module/peerCreator";
import { SP2P } from "../../sp2p/main";
import { testSetupNodes } from "../setupNetwork";
import { PeerWebRTCModule } from "../../vendor/kademlia/modules/peer/webrtc";

describe("domain/subnet", () => {
  test("webrtc", async () => {
    const nodes = await testSetupNodes(4, PeerWebRTCModule, {
      timeout: 5_000
    });
    const actors = nodes.map(
      v => new SP2P({ PeerCreator: new PeerCreator(PeerWebRTCModule) }, v, {})
    );

    const seederNode = actors.shift()!;
    const { url } = await seederNode.seeder.storeStatic(
      "test",
      Buffer.from("test")
    );

    for (let actor of actors) {
      await actor.user.connectSubNet(url).catch(console.warn);
    }

    expect(
      actors[0].services.SubNetworkManager.getSubNetwork(url).allPeers.length >
        1
    ).toBe(true);

    actors.forEach(actor => actor.dispose());
  }, 600_000);
});
