import { PeerCreator } from "../../sp2p/module/peerCreator";
import { PeerModule } from "../../vendor/kademlia";
import { SP2P } from "../../sp2p/main";
import { testSetupNodes } from "../setupNetwork";

describe("domain/subnet", () => {
  test("", async () => {
    const nodes = await testSetupNodes(4, PeerModule, {
      timeout: 5_000
    });
    const actors = nodes.map(
      v => new SP2P({ PeerCreator: new PeerCreator(PeerModule) }, v, {})
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
