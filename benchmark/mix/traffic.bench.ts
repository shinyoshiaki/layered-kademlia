import {
  getTrafficContextTraffic,
  resetTrafficContext
} from "../mock/peer/traffic";

import { benchmarkKadTraffic } from "../kad/traffic/benchmark";
import { benchmarkLayeredTraffic } from "../layered/traffic/benchmark";

const NODE_NUM = 100;
const GROUP_NUM = NODE_NUM / 2;
const KBUCKET_SIZE = 20;

test(
  "mix/traffic",
  async () => {
    await benchmarkLayeredTraffic(NODE_NUM, GROUP_NUM, KBUCKET_SIZE);
    resetTrafficContext();
    console.log("reset", getTrafficContextTraffic());
    await benchmarkKadTraffic(NODE_NUM, GROUP_NUM, KBUCKET_SIZE);
    await new Promise(r => setTimeout(r, 2000));
  },
  60_000 * 60 * 24
);
