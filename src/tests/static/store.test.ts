import { PeerCreater } from "../../module/peerCreater";
import { PeerMockModule } from "../../vendor/kademlia";
import { SP2P } from "../../adapter/actor";
import { testSetupNodes } from "../setupnetwork";

test("store", async () => {
  const num = 4;
  const nodes = await testSetupNodes(num, PeerMockModule, { timeout: 1000 });
  const actors = nodes.map(
    node => new SP2P({ PeerCreater: new PeerCreater() }, node)
  );

  const actor = actors.pop()!;
  const { url, meta } = await actor.seeder.storeStatic(
    "test",
    Buffer.from("hello")
  );

  {
    const exist = actors.find(({ services }) =>
      services.SubNetworkManager.getSubNetwork(url).kvs.get(
        meta.payload.keys[0]
      )
    );

    expect(exist).toBeUndefined();
  }
  {
    const exist = actors.find(({ mainNet }) =>
      mainNet.kad.di.modules.kvs.get(url)
    );

    expect(exist).not.toBeUndefined();
  }
  {
    const exist = actors.find(({ services }) =>
      services.SubNetworkManager.getSubNetwork(url)
    );

    expect(exist).not.toBeUndefined();
  }
}, 60_000_0);
