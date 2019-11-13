import { benchmarkKadTraffic } from "../kad/traffic/benchmark";
import { benchmarkLayeredTraffic } from "../layered/traffic/benchmark";
import { resetTrafficContext } from "../mock/peer/traffic";

test(
  "mix/traffic",
  async () => {
    await benchmarkLayeredTraffic();
    resetTrafficContext();
    await benchmarkKadTraffic();
  },
  60_000 * 60 * 4
);
