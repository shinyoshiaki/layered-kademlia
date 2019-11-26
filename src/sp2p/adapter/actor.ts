import { InjectServices, injectServices } from "../service";

import { CreatePeer } from "../service/peer/createPeer";
import Kademlia from "../../vendor/kademlia";
import { MainNetwork } from "../entity/network/main";
import { NavigatorContainer } from "../usecase/actor/navigator";
import { PeerCreator } from "../module/peerCreator";
import { SeederContainer } from "../usecase/actor/seeder";
import { SubNetworkManager } from "../service/network/submanager";
import { User } from "../usecase/actor/user";

export type Options = Partial<{ subNetTimeout: number; kBucketSize: number }>;
const initialOptions: Options = { subNetTimeout: 5000, kBucketSize: 20 };

export class SP2P {
  constructor(
    private modules: { PeerCreator: PeerCreator },
    private existKad: Kademlia,
    private options: Options = initialOptions
  ) {}

  getOptions() {
    return { ...initialOptions, ...this.options };
  }

  services: InjectServices = {
    ...injectServices(),
    CreatePeer: new CreatePeer({ PeerCreator: this.modules.PeerCreator }),
    SubNetworkManager: new SubNetworkManager(this.getOptions())
  };
  mainNet = new MainNetwork(this.existKad);
  user = new User(this.services, this.mainNet, this.getOptions());
  navigator = new NavigatorContainer(
    this.services,
    this.mainNet,
    this.getOptions()
  );
  seeder = new SeederContainer(this.services, this.mainNet, this.getOptions());

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
