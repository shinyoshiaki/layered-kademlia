import {
  getTrafficContextTraffic,
  resetTrafficContext
} from "../mock/peer/traffic";

import { benchmarkKadTraffic } from "./kad";
import { benchmarkLayeredTraffic } from "./layered";

const NODE_NUM = 10;
const GROUP_NUM = NODE_NUM / 2;

test(
  "mix/traffic",
  async () => {
    await benchmarkLayeredTraffic(NODE_NUM, GROUP_NUM);
    resetTrafficContext();
    console.log("reset", getTrafficContextTraffic());
    await benchmarkKadTraffic(NODE_NUM, GROUP_NUM);
    await new Promise(r => setTimeout(r, 2000));
  },
  60_000 * 60 * 24
);
