import { PeerCreater } from "../../sp2p/module/peerCreater";
import { PeerModule } from "../../vendor/kademlia";
import { SP2P } from "../../sp2p/adapter/actor";
import { testSetupNodes } from "../setupnetwork";

describe("domain/subnet", () => {
  test("", async () => {
    const nodes = await testSetupNodes(4, PeerModule, {
      timeout: 1_000
    });
    const actors = nodes.map(
      v => new SP2P({ PeerCreater: new PeerCreater(PeerModule) }, v, {})
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
