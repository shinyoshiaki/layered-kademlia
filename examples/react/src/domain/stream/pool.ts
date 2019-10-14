export class StreamPool {
  pool: ArrayBuffer[] = [];
  interval?: any;
  constructor() {
    this.interval = setInterval(() => {}, 1000);
  }
}
