import { KadWorker } from "./kad.worker";
import { Worker } from "worker_threads";
import { workerThreadsWrapper } from "airpc/module/workerThreads";
import { wrap } from "airpc";

const log = (...s: any[]) => console.log(`kad/worker `, ...s);

export async function kadBench(
  NODE_NUM: number,
  GROUP_NUM: number,
  debug = false
) {
  const path = debug ? "/benchmark/worker/" : "/";

  log();

  const workers = [...Array(NODE_NUM)].map(() =>
    wrap(
      KadWorker,
      workerThreadsWrapper(
        new Worker(`.${path}/worker.js`, {
          workerData: { path: "./worker/kad.worker.ts" }
        })
      )
    )
  );

  for (let worker of workers) {
    await worker.init();
  }

  log("worker setup done");

  for (let i = 1; i < workers.length; i++) {
    const offerNode = workers[i - 1];
    const answerNode = workers[i];

    const answerKid = await answerNode.getKid();
    const offerKid = await offerNode.getKid();

    const offerSdp = await offerNode.offer(answerKid);
    const answerSdp = await answerNode.setOffer(offerKid, offerSdp);
    await offerNode.setAnswer(answerSdp);

    await offerNode.kadAddPeer();
    await answerNode.kadAddPeer();

    await offerNode.kadFindNode(offerKid);
    await answerNode.kadFindNode(answerKid);
  }

  log("network setup done");

  const start = Date.now();

  const group = workers.length / GROUP_NUM;

  const urls = await Promise.all(
    [...Array(GROUP_NUM)].map(async () => {
      const worker = workers.shift()!;
      const url = await worker.kadStore(Buffer.from("benchmark"));
      if (!url) throw new Error("fail");
      return url;
    })
  );

  log("store done");

  const values = (
    await Promise.all(
      workers.map(async (worker, i) => {
        const url = urls[Math.floor(i / group)];
        const res = await worker.kadFindValue(url);
        if (res) return res;
      })
    )
  ).filter(v => !!v) as ArrayBuffer[];

  log("findvalue", values.length);

  log("end bench", (Date.now() - start) / 1000 + "s", "traffic");

  await Promise.all(workers.map(async worker => await worker.dispose()));

  log("clean up");
  process.exit();
}
