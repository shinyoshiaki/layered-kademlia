import { benchmarkKadTraffic } from "../kad/traffic/benchmark";
import { benchmarkLayeredTraffic } from "../layered/traffic/benchmark";
import { resetTrafficContext } from "../mock/peer/traffic";

const NODE_NUM = 20;
const GROUP_NUM = 2;
const KBUCKET_SIZE = 20;

test(
  "mix/traffic",
  async () => {
    await benchmarkLayeredTraffic(NODE_NUM, GROUP_NUM, KBUCKET_SIZE);
    resetTrafficContext();
    await benchmarkKadTraffic(NODE_NUM, GROUP_NUM, KBUCKET_SIZE);
    await new Promise(r => setTimeout(r, 2000));
  },
  60_000 * 60 * 24
);
