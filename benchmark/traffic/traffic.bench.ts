import { benchmarkKadTraffic } from "./kad";
import { benchmarkLayeredTraffic } from "./layered";
import { resetTrafficContext } from "../mock/peer/traffic";

(async () => {
  for (let NODE_NUM = 10; NODE_NUM <= 50; NODE_NUM += 10) {
    console.log(NODE_NUM);
    resetTrafficContext();
    const GROUP_NUM = NODE_NUM / 2;
    await benchmarkLayeredTraffic(NODE_NUM, GROUP_NUM);
    resetTrafficContext();
    await benchmarkKadTraffic(NODE_NUM, GROUP_NUM);
    await new Promise(r => setTimeout(r, 2000));
  }
})();
