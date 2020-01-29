import { layeredBench } from "./layered";

const NODE_NUM = 16;
const GROUP_NUM = NODE_NUM / 2;

(async () => {
  for (let VALUE = "1", i = 0; i <= 6; i++, VALUE += "1") {
    await layeredBench(NODE_NUM, GROUP_NUM, VALUE);
  }
})();
