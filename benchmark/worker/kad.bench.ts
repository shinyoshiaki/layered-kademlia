import { kadBench } from "./kad";

const NODE_NUM = 20;
const GROUP_NUM = NODE_NUM / 2;

kadBench(NODE_NUM, GROUP_NUM);