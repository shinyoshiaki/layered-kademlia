import * as Comlink from "comlink";

import { ComlinkWorker } from "./worker";
import { Worker } from "worker_threads";

const requireEsm = require("esm")(module);
const nodeEndpoint = requireEsm("comlink/dist/esm/node-adapter.mjs").default;

test(
  "worker",
  async () => {
    const worker = new Worker("./worker.js", {
      workerData: { path: "./playground/worker.ts" }
    });

    const linked = Comlink.wrap<ComlinkWorker>(nodeEndpoint(worker));

    console.log(await linked.factorial(15));
  },
  60_000 * 60
);
