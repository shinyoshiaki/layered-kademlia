import { kadBench } from "./kad";

const NODE_NUM = 16;
const GROUP_NUM = NODE_NUM / 2;

test(
  "worker",
  async () => {
    await kadBench(NODE_NUM, GROUP_NUM);
    await new Promise(r => setTimeout(r, 30_000));
  },
  60_000 * 60
);
