import { PeerModule } from "../vendor/kademlia";
import { testSetupNodes } from "./setupNetwork";

describe("setup network", () => {
  test("mock", async () => {
    const num = 5;
    const nodes = await testSetupNodes(num, PeerModule, {
      kBucketSize: 8,
      timeout: 200
    });
    expect(nodes.length).toBe(num);
    nodes.forEach(v => v.dispose());
  }, 60_000_0);
});
