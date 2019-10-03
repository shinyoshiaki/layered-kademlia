import { ActorAdapter } from "./actor";
import { testSetupNodes } from "../test/setupnetwork";

describe("Adapter", () => {
  test("store", async () => {
    const num = 4;
    const nodes = await testSetupNodes(num);
    const actors = nodes.map(node => new ActorAdapter(node));

    const actor = actors.pop()!;
    const { url, meta } = await actor.seeder.store(
      "test",
      Buffer.from("hello")
    );

    {
      const exist = actors.find(({ services }) =>
        services.SubNetworkManager.getSubNetwork(url).kvs.get(meta.keys[0])
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
    const num = 4;
    const nodes = await testSetupNodes(num);
    const actors = nodes.map(node => new ActorAdapter(node));
    const { url } = await actors[0].seeder.store("test", Buffer.from("hello"));
    const res = await actors[num - 1].user.find(url);
    expect(Buffer.from(res!)).toEqual(Buffer.from("hello"));
  }, 60_000_0);
});
