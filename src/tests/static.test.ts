import { ActorAdapter } from "../adapter/actor";
import { StaticMeta } from "../entity/data/meta";
import { testSetupNodes } from "./setupnetwork";

describe("static", () => {
  test("store", async () => {
    const num = 4;
    const nodes = await testSetupNodes(num);
    const actors = nodes.map(node => new ActorAdapter(node));

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

  test("find", async () => {
    const num = 10;
    const nodes = await testSetupNodes(num);
    const actors = nodes.map(node => new ActorAdapter(node));
    const { url } = await actors[0].seeder.storeStatic(
      "test",
      Buffer.from("hello")
    );
    const res = await actors[num - 1].user.connectSubNet(url);
    expect(res).not.toBeUndefined();
    if (res) {
      const { subNet, meta } = res;
      const ab = await subNet.findStaticMetaTarget(meta as StaticMeta);
      expect(Buffer.from(ab!)).toEqual(Buffer.from("hello"));
    }
  }, 60_000_0);
});
