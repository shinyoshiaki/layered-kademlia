import { setupLayered } from "./setupLayered";

const NODE_NUM = 10;
const GROUP_NUM = NODE_NUM / 2;

const log = (...s: any[]) => console.log(`layered/traffic `, ...s);

test(
  "worker",
  async () => {
    const start = Date.now();
    const workers = await setupLayered(NODE_NUM);
    const group = workers.length / GROUP_NUM;

    const urls = await Promise.all(
      [...Array(GROUP_NUM)].map(async () => {
        const worker = workers.shift()!;
        const res = await worker.seederStoreStatic(
          await worker.getKid(),
          Buffer.from("benchmark")
        );
        if (!res) throw new Error("fail");

        return res.url;
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

    await new Promise(r => setTimeout(r, 1000));
  },
  60_000 * 60
);
