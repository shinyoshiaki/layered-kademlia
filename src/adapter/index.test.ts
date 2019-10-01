import { ActorAdapter } from "./actor";
import { testSetupNodes } from "../test/setupnetwork";

describe("User", () => {
  test("find", async () => {
    const nodes = await testSetupNodes(8);
    const actors = nodes.map(node => new ActorAdapter(node));
    const url = await actors[0].seeder.store("test", Buffer.from("hello"));
    const res = await actors[7].user.find(url);
    expect(res).toEqual("hello");
  }, 600000);
});
