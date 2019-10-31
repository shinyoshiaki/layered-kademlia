import Event from "rx.mini";
import { encode } from "@msgpack/msgpack";

export class StreamPool<T> {
  private pool: { v: T; t: number }[] = [];
  event = new Event<Uint8Array[]>();
  interval?: any;
  constructor(cycle: number) {
    this.interval = setInterval(() => {
      this.event.execute(
        this.pool.map(({ v, t }, i) =>
          encode({
            v,
            t: i > 0 ? t - this.pool[i - 1].t : 0
          })
        )
      );
      this.pool = [];
    }, cycle);
  }

  push(v: T) {
    this.pool.push({ v, t: new Date().getTime() });
  }

  dispose() {
    clearInterval(this.interval);
  }
}
