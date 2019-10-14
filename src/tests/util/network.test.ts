import { Sequence } from "../../entity/network/util";

describe("util/network", () => {
  test("sequence", async () => {
    const seq = new Sequence<string>();
    setTimeout(() => {
      seq.push("some", 0);
    }, 0);
    let res: any = await seq.event.asPromise(1);
    expect(res).toBe("some");

    setTimeout(() => {
      seq.push("some1", 1);
    }, 0);
    res = await seq.event.asPromise(1);
    expect(res).toBe("some1");

    setTimeout(() => {
      seq.push("skip", 3);
    }, 0);
    res = await seq.event.asPromise(1).catch(() => undefined);
    expect(res).toBeUndefined();

    setTimeout(() => {
      seq.push("back", 2);
    }, 0);
    res = await new Promise<boolean>(r => {
      let i = 0;
      const { unSubscribe } = seq.event.subscribe(v => {
        if (i === 0) {
          expect(v).toBe("back");
        } else {
          expect(v).toBe("skip");
        }
        i++;
        if (i == 2) {
          unSubscribe();
          r(true);
        }
      });
    });
    expect(res).toBe(true);
  });
});
