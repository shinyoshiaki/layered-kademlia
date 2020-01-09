import { InjectServices, createServices, injectDependency } from "./service";

import { CreatePeer } from "./service/peer/createPeer";
import Kademlia from "../vendor/kademlia";
import { MainNetwork } from "./entity/network/main";
import { NavigatorContainer } from "./usecase/actor/navigator";
import { NavigatorManager } from "./service/manager/navigator";
import { PeerCreator } from "./module/peerCreator";
import { SeederContainer } from "./usecase/actor/seeder";
import { SeederManager } from "./service/manager/seeder";
import { SubNetworkManager } from "./service/manager/submanager";
import { User } from "./usecase/actor/user";

export type Options = {
  subNetTimeout: number;
  kBucketSize: number;
  kadTimeout: number;
  metaChunksSize: number;
};
const initialOptions: Required<Options> = {
  subNetTimeout: 5000,
  kBucketSize: 20,
  kadTimeout: 5000,
  metaChunksSize: 16000
};

export class SP2P {
  constructor(
    private modules: { PeerCreator: PeerCreator },
    private existKad: Kademlia,
    private partialOptions?: Partial<Options>
  ) {}

  get options() {
    return { ...initialOptions, ...this.partialOptions };
  }

  initialServices: InjectServices = {
    ...createServices(),
    CreatePeer: new CreatePeer({ PeerCreator: this.modules.PeerCreator }),
    SubNetworkManager: new SubNetworkManager(this.options),
    NavigatorManager: new NavigatorManager(this.options),
    SeederManager: new SeederManager(this.options)
  };

  get services() {
    return injectDependency(this.initialServices);
  }

  mainNet = new MainNetwork(this.existKad);
  user = new User(this.services, this.mainNet, this.options);
  navigator = new NavigatorContainer(this.services, this.mainNet, this.options);
  seeder = new SeederContainer(this.services, this.mainNet, this.options);

  dispose() {
    this.mainNet.kad.dispose();

    this.services.NavigatorManager.allNavigator.forEach(nav =>
      nav.seederPeer.disconnect()
    );

    this.services.SeederManager.allSeeder.forEach(seeder => {
      Object.values(seeder.navigatorPeers).forEach(peer => peer.disconnect());
    });

    this.services.SubNetworkManager.dispose();
  }
}
