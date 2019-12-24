import { layeredBench } from "./layered";

const NODE_NUM = 16;
const GROUP_NUM = NODE_NUM / 2;
const VALUE = "123456789";

layeredBench(NODE_NUM, GROUP_NUM, VALUE);
