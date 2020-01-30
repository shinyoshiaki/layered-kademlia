import { layeredBench } from "./layered";
import { VALUE_LENGTH, GROUP_NUM, NODE_NUM } from "./param";

const VALUE = [...Array(VALUE_LENGTH)].map(() => "1").join("");

layeredBench(NODE_NUM, GROUP_NUM, VALUE);
