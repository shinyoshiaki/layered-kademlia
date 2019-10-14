import Kademlia, { Options } from "../../vendor/kademlia";

import Event from "rx.mini";
import KeyValueStore from "../../vendor/kademlia/modules/kvs/base";
import PeerModule from "../../vendor/kademlia/modules/peer";
import genKid from "../../vendor/kademlia/util/kid";

export const genKad = (option?: Options) =>
  new Kademlia(
    genKid(),
    { peerCreate: PeerModule, kvs: new KeyValueStore() },
    option
  );

export class Sequence<T> {
  event = new Event<T>();

  private map: { [index: number]: T } = {};

  push(v: T, index: number) {
    if (Object.keys(this.map).length === 0) this.event.execute(v);

    this.map[index] = v;

    const exist = this.map[index - 1];
    if (exist) this.execute(index);
  }

  private execute(index: number) {
    const exist = this.map[index];
    if (exist) {
      this.event.execute(this.map[index]);
      delete this.map[index - 1];
      this.execute(index + 1);
    }
  }
}
