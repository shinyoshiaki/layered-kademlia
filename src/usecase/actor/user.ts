import { CreatePeer } from "../../service/peer/createPeer";
import { MainNetwork } from "../../entity/network/main";
import { Peer } from "../../vendor/kademlia";
import { SubNetworkManager } from "../../service/network/submanager";

export type Network = {
  store: (v: string) => Promise<string>;
  findValue: (url: string) => Promise<Peer | undefined>;
};

export class User {
  constructor(
    private services: {
      SubNetworkManager: SubNetworkManager;
      CreatePeer: CreatePeer;
    },
    private mainNet: MainNetwork
  ) {}

  connectSubNet = async (url: string) => {
    const { SubNetworkManager, CreatePeer } = this.services;

    const res = await this.mainNet.findValue(url);
    if (!res) return;
    const { peer, meta } = res;

    if (!SubNetworkManager.isExist(url)) {
      // connect to seeder via navigator
      const seederPeer = await CreatePeer.connect(url, this.mainNet.kid, peer);

      const subNet = SubNetworkManager.createNetwork(url);
      await subNet.addPeer(seederPeer);
      return { subNet, meta };
    }
    const subNet = SubNetworkManager.getSubNetwork(url);
    return { subNet, meta };
  };
}
