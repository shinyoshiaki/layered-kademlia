import {
  getTrafficContextTraffic,
  resetTrafficContext
} from "../mock/peer/traffic";

import { benchmarkKadTraffic } from "../kad/traffic/benchmark";
import { benchmarkLayeredTraffic } from "../layered/traffic/benchmark";

const NODE_NUM = 25;

test(
  "mix/traffic",
  async () => {
    await benchmarkLayeredTraffic(NODE_NUM);
    resetTrafficContext();
    console.log("reset", getTrafficContextTraffic());
    await benchmarkKadTraffic(NODE_NUM);
    await new Promise(r => setTimeout(r, 2000));
  },
  60_000 * 60 * 24
);
