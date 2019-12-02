import { MessageChannel, Worker } from "worker_threads";
const { port1, port2 } = new MessageChannel();

const root = "./benchmark/";

test(
  "worker",
  async () => {
    const worker = new Worker(root + "worker.js", {
      workerData: { path: "./worker.ts" }
    });

    await new Promise(r => {
      port1.on("message", res => {
        console.log(res);
        r();
      });
      worker.postMessage({ port: port2, value: 15 }, [port2]);
    });
  },
  60_000 * 60
);
