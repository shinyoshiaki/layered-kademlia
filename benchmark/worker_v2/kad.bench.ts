import { kadBench } from "./kad";

const NODE_NUM = 16;
const GROUP_NUM = NODE_NUM / 2;
const VALUE = "benchmark";
export const TIMEOUT = 5_000;

kadBench(NODE_NUM, GROUP_NUM, VALUE);
