import { workerThreadsWrapper, wrap } from "airpc";

import { KadWorker } from "./kad.worker";
import { Worker } from "worker_threads";

const log = (...s: any[]) => console.log(`kad/worker `, ...s);

export async function kadBench(NODE_NUM: number, GROUP_NUM: number) {
  const start = Date.now();

  const workers = [...Array(NODE_NUM)].map(() =>
    wrap(
      KadWorker,
      workerThreadsWrapper(
        new Worker("./worker.js", {
          workerData: { path: "./worker/kad.worker.ts" }
        })
      )
    )
  );

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

  const group = workers.length / GROUP_NUM;

  const urls = await Promise.all(
    [...Array(GROUP_NUM)].map(async () => {
      const worker = workers.shift()!;
      const res = await worker.kadStore(Buffer.from("benchmark"));
      if (!res) throw new Error("fail");
      return res.key;
    })
  );

  const values = (
    await Promise.all(
      workers.map(async (worker, i) => {
        const url = urls[Math.floor(i / group)];
        const res = await worker.kadFindValue(url);
        if (res) return res.value;
      })
    )
  ).filter(v => !!v) as ArrayBuffer[];

  log("findvalue", values.length);

  log("end bench", (Date.now() - start) / 1000 + "s", "traffic");

  await new Promise(r => setTimeout(r, 1000));
}
