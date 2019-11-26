import Event from "rx.mini";
import { Meta } from "../../entity/data/meta";
import { Options } from "../../main";
import { PeerCreator } from "../../module/peerCreator";
import { SubNetwork } from "../../entity/network/sub";
import sha1 from "sha1";

export class SubNetworkManager {
  list: { [url: string]: SubNetwork } = {};

  event = new Event();

  constructor(private opt: Options) {}

  createNetwork(meta: Meta, peerCrater: PeerCreator, kid: string) {
    const url = sha1(JSON.stringify(meta));
    if (this.isExist(url)) return this.list[url];
    this.list[url] = new SubNetwork(this.opt, peerCrater, kid, meta);
    this.event.execute(null);
    return this.list[url];
  }

  isExist(url: string) {
    return this.list[url] ? true : false;
  }

  getSubNetwork(url: string) {
    return this.list[url];
  }

  dispose() {
    Object.values(this.list).forEach(v => v.kad.dispose());
    this.list = {};
  }
}
