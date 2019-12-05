import * as Comlink from "comlink";

import { parentPort } from "worker_threads";

const requireEsm = require("esm")(module);
const nodeEndpoint = requireEsm("comlink/dist/esm/node-adapter.mjs").default;

export class ComlinkWorker {
  factorial(n: number): number {
    if (n === 1 || n === 0) {
      return 1;
    }
    return this.factorial(n - 1) * n;
  }
}

Comlink.expose(ComlinkWorker, nodeEndpoint(parentPort!));
