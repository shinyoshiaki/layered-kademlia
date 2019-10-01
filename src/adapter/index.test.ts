import { ActorAdapter } from "./actor";
import { testSetupNodes } from "../test/setupnetwork";

describe("User", () => {
  test("find", async () => {
    const num = 4;
    const nodes = await testSetupNodes(num);
    const actors = nodes.map(node => new ActorAdapter(node));
    const url = await actors[0].seeder.store("test", Buffer.from("hello"));
    const res = await actors[num - 1].user.find(url);
    expect(res).toEqual("hello");
  }, 600000);
});
