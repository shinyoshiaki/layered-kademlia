import { benchmarkKadTraffic } from "./kad";
import { benchmarkLayeredTraffic } from "./layered";
import { resetTrafficContext } from "../mock/peer/traffic";

const NODE_NUM = 20;
const GROUP_NUM = NODE_NUM / 2;

(async () => {
  await benchmarkLayeredTraffic(NODE_NUM, GROUP_NUM);
  resetTrafficContext();
  await benchmarkKadTraffic(NODE_NUM, GROUP_NUM);
  await new Promise(r => setTimeout(r, 2000));
})();
