import { kadBench } from "./kad";

const NODE_NUM = 16;
const GROUP_NUM = NODE_NUM / 2;
const VALUE_LENGTH = 1;

const VALUE = [...Array(VALUE_LENGTH)].map(() => "1").join("");

kadBench(NODE_NUM, GROUP_NUM, VALUE);
