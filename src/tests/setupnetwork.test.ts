import { testSetupNodes } from "./setupNetwork";
import { PeerMockModule } from "../vendor/kademlia/modules/peer/base";

describe("setup network", () => {
  test("mock", async () => {
    const num = 5;
    const nodes = await testSetupNodes(num, PeerMockModule, {
      kBucketSize: 8,
      timeout: 5000
    });
    expect(nodes.length).toBe(num);
    nodes.forEach(v => v.dispose());
  }, 60_000_0);
});
