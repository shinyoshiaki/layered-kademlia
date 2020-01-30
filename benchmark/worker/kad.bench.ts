import { kadBench } from "./kad";
import { VALUE_LENGTH, GROUP_NUM, NODE_NUM } from "./param";

const VALUE = [...Array(VALUE_LENGTH)].map(() => "1").join("");

kadBench(NODE_NUM, GROUP_NUM, VALUE);
