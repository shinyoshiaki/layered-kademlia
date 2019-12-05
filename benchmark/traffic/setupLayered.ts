import { workerThreadsWrapper, wrap } from "airpc";

import { LayeredWorker } from "./layered.worker";
import { Worker } from "worker_threads";

export async function setupLayered(NODE_NUM: number) {
  const workers = [...Array(NODE_NUM)].map(() =>
    wrap(
      LayeredWorker,
      workerThreadsWrapper(
        new Worker("./benchmark/worker.js", {
          workerData: { path: "./traffic/layered.worker.ts" }
        })
      )
    )
  );

  for (let i = 1; i < workers.length; i++) {
    const answerNode = workers[i - 1];
    const offerNode = workers[i];

    const answerKid = await answerNode.getKid();
    const offerKid = await offerNode.getKid();

    const offerSdp = await offerNode.offer(answerKid);
    const answerSdp = await answerNode.setOffer(offerKid, offerSdp);
    await offerNode.setAnswer(answerSdp);

    await offerNode.kadFindNode(offerKid);
    await answerNode.kadFindNode(answerKid);
  }

  return workers;
}
