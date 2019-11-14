import { PeerModule } from "../vendor/kademlia";
import { testSetupNodes } from "./setupNetwork";

describe("setup network", () => {
  test("mock", async () => {
    const nodes = await testSetupNodes(10, PeerModule, {
      kBucketSize: 8,
      timeout: 200
    });
    expect(nodes.length).toBe(10);
    nodes.forEach(v => v.dispose());
  }, 60_000_0);
});
