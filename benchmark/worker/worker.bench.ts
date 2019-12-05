import { kadBench } from "./kad";
import { layeredBench } from "./layered";

const NODE_NUM = 20;
const GROUP_NUM = NODE_NUM / 2;

test(
  "worker",
  async () => {
    await layeredBench(NODE_NUM, GROUP_NUM);
    await kadBench(NODE_NUM, GROUP_NUM);
    await new Promise(r => setTimeout(r, 2000));
  },
  60_000 * 60
);
