import { workerThreadsWrapper, wrap } from "airpc";

import { LayeredWorker } from "./layered.worker";
import { Worker } from "worker_threads";

const log = (...s: any[]) => console.log(`layered/worker `, ...s);

export async function layeredBench(
  NODE_NUM: number,
  GROUP_NUM: number,
  debug = false
) {
  const start = Date.now();
  const path = debug ? "/benchmark/worker/" : "/";

  const workers = [...Array(NODE_NUM)].map(() =>
    wrap(
      LayeredWorker,
      workerThreadsWrapper(
        new Worker(`.${path}/worker.js`, {
          workerData: { path: "./worker/layered.worker.ts" }
        })
      )
    )
  );

  for (let worker of workers) {
    await worker.init();
  }

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

  for (let worker of workers) {
    await worker.kadFindNode(await worker.getKid());
  }

  const group = workers.length / GROUP_NUM;

  const urls = await Promise.all(
    [...Array(GROUP_NUM)].map(async () => {
      const worker = workers.shift()!;
      const url = await worker.seederStoreStatic(
        Math.random().toString(),
        Buffer.from("benchmark")
      );
      if (!url) throw new Error("fail");
      return url;
    })
  );

  const values = (
    await Promise.all(
      workers.map(async (worker, i) => {
        const url = urls[Math.floor(i / group)];
        const res = await worker.userFindStatic(url);
        if (res) return res;
      })
    )
  ).filter(v => !!v) as ArrayBuffer[];

  log("findvalue", values.length);

  log("end bench", (Date.now() - start) / 1000 + "s", "traffic");

  await Promise.all(workers.map(async worker => await worker.dispose()));
}
