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
import { RPCNavigatorCandidateOffer2Seeder } from "./navigator";
import { Seeder } from "../../entity/actor/seeder";
import { Signal } from "webrtc4me";
import { SubNetwork } from "../../entity/network/sub";

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

  connect = async (meta: Meta) => {
    const { SeederManager, SubNetworkManager, CreatePeer } = this.services;
    const { url, peers } = await this.mainNet.store(meta);
    const subNet = SubNetworkManager.createNetwork(
      meta,
      CreatePeer.peerCreator,
      this.mainNet.kid
    );
    const seeder = SeederManager.createSeeder(
      url,
      this.mainNet,
      subNet,
      this.services,
      this.options
    );

    await this.setupNavigators(meta, peers, seeder);
    return { seeder, url };
  };

  userConnect = async (meta: Meta, subNet: SubNetwork) => {
    const { SeederManager } = this.services;
    const { url, peers } = await this.mainNet.store(meta);

    const seeder = SeederManager.createSeeder(
      url,
      this.mainNet,
      subNet,
      this.services,
      this.options
    );

    await this.setupNavigators(meta, peers, seeder);
    return { seeder, url };
  };

  private async setupNavigators(
    meta: Meta,
    navigatorCandidatePeers: Peer[],
    seeder: Seeder
  ) {
    const { CreatePeer, RpcManager } = this.services;
    const { subNetTimeout } = this.options;

    const navigatorPeers = (
      await Promise.all(
        navigatorCandidatePeers.map(
          candidatePeer =>
            new Promise<Peer | undefined>(async r => {
              const res = await RpcManager.getWait<
                RPCNavigatorCandidateOffer2Seeder
              >(
                candidatePeer,
                RPCSeederNavigatorCandidate(
                  JSON.stringify(meta),
                  candidatePeer.kid
                )
              )(subNetTimeout).catch(() => {});

              if (!res) {
                console.log("timeout");
                r();
                return;
              }

              const navigatorPeer = CreatePeer.peerCreator.create(
                candidatePeer.kid
              );
              const answer = await navigatorPeer
                .setOffer(res.sdp)
                .catch(() => {});
              if (!answer) {
                r();
                return;
              }

              candidatePeer.rpc({
                ...RPCSeederAnswer2Navigator(answer),
                id: res.id
              });

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
      )
    ).filter(v => v) as Peer[];

    navigatorPeers.forEach(navigatorPeer => {
      seeder.addNavigatorPeer(navigatorPeer);
    });
  }

  storeStatic = async (name: string, ab: Buffer) => {
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

const RPCSeederNavigatorCandidate = (metaStr: string, targetId: string) => ({
  type: "RPCSeederNavigatorCandidate" as const,
  metaStr,
  targetId
});

export type RPCSeederNavigatorCandidate = ReturnType<
  typeof RPCSeederNavigatorCandidate
>;

const RPCSeederAnswer2Navigator = (sdp: Signal) => ({
  type: "RPCSeederAnswer2Navigator",
  sdp
});

export type RPCSeederAnswer2Navigator = ReturnType<
  typeof RPCSeederAnswer2Navigator
>;
