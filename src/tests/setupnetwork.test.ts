import { PeerMockModule } from "../vendor/kademlia";
import { testSetupNodes } from "./setupnetwork";

describe("setup network", () => {
  test("mock", async () => {
    const nodes = await testSetupNodes(10, PeerMockModule, {
      kBucketSize: 8,
      timeout: 200
    });
    expect(nodes.length).toBe(10);
  }, 60_000_0);
});
