import { SP2P } from "../../../src/adapter/actor";
import { portalNode } from "./portal";
import { testSetupNodes } from "../../../src/tests/setupnetwork";

(async () => {
  const nodes = await testSetupNodes(10);
  nodes.map(node => new SP2P(node));
  const kad = nodes.pop()!;
  portalNode(kad, 20000);
})();
