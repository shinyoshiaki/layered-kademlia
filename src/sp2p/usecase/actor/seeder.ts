import {
  Meta,
  StreamMetaPayload,
  createStaticMeta,
  createStreamMeta
} from "../../entity/data/meta";

import Event from "rx.mini";
import { InjectServices } from "../../service";
import { MainNetwork } from "../../entity/network/main";
import { Options } from "../../adapter/actor";
import { Peer } from "../../../vendor/kademlia";
import { RPCNavigatorOffer2Seeder } from "./navigator";
import { Seeder } from "../../entity/actor/seeder";
import { Signal } from "webrtc4me";

export class SeederContainer {
  constructor(
    private services: InjectServices,
    private mainNet: MainNetwork,
    private options: Options
  ) {}

  onSubnetAdd = this.services.SubNetworkManager.event.returnListener;
  get subnetList() {
    return this.services.SubNetworkManager.list;
  }

  private connect = async (meta: Meta) => {
    const { SeederManager, SubNetworkManager, CreatePeer } = this.services;
    const { url, peers } = await this.mainNet.store(meta);
    const subNet = SubNetworkManager.createNetwork(
      meta,
      CreatePeer.peerCreater,
      this.mainNet.kid
    );
    const seeder = SeederManager.createSeeder(
      url,
      this.mainNet,
      subNet,
      this.services
    );

    await this.setupNavigators(url, peers, seeder);
    return { seeder, url };
  };

  private async setupNavigators(url: string, peers: Peer[], seeder: Seeder) {
    const { CreatePeer, RpcManager } = this.services;
    const { subNetTimeout } = this.options;

    const navigatorPeers = (await Promise.all(
      peers.map(
        peer =>
          new Promise<Peer | undefined>(async r => {
            const wait = RpcManager.getWait<RPCNavigatorOffer2Seeder>(
              peer,
              RPCSeederStoreDone(url)
            );
            const res = await wait(subNetTimeout).catch(() => {});
            if (!res) {
              r();
              return;
            }

            const navigatorPeer = CreatePeer.peerCreater.create(peer.kid);
            const answer = await navigatorPeer
              .setOffer(res.sdp)
              .catch(() => {});
            if (!answer) {
              r();
              throw new Error("timeout setoffer");
            }

            peer.rpc({ ...RPCSeederAnswer2Navigator(answer), id: res.id });

            const err = await navigatorPeer.onConnect
              .asPromise(subNetTimeout)
              .catch(() => "err");

            if (err) {
              r();
              return;
            }

            r(navigatorPeer);
          })
      )
    )).filter(v => v) as Peer[];

    navigatorPeers.forEach(peer => seeder.addNavigatorPeer(peer));
  }

  storeStatic = async (name: string, ab: ArrayBuffer) => {
    const { meta, chunks } = createStaticMeta(name, ab);
    const { seeder, url } = await this.connect(meta);

    chunks.forEach(ab => seeder.setAsset(ab));

    return { url, meta };
  };

  async storeStream(
    name: string,
    first: ArrayBuffer,
    payload: Omit<StreamMetaPayload, "first">
  ) {
    const meta = createStreamMeta(name, first, payload);
    const { seeder, url } = await this.connect(meta);

    const event = new Event<ArrayBuffer | undefined>();
    let prev = first;

    const { unSubscribe } = event.subscribe(ab => {
      seeder.setChunk(prev, ab);
      if (!ab) {
        unSubscribe();
        return;
      }
      prev = ab;
    });

    return { event: event.returnTrigger, url };
  }
}

const RPCSeederStoreDone = (url: string) => ({
  type: "RPCSeederStoreDone" as const,
  url
});

export type RPCSeederStoreDone = ReturnType<typeof RPCSeederStoreDone>;

const RPCSeederAnswer2Navigator = (sdp: Signal) => ({
  type: "RPCSeederAnswer2Navigator",
  sdp
});

export type RPCSeederAnswer2Navigator = ReturnType<
  typeof RPCSeederAnswer2Navigator
>;
