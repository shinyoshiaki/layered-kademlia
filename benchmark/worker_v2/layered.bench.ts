import { layeredBench } from "./layered";

const NODE_NUM = 16;
const GROUP_NUM = NODE_NUM / 2;
const VALUE = "benchmark";
export const TIMEOUT = 60_000;

layeredBench(NODE_NUM, GROUP_NUM, VALUE);
