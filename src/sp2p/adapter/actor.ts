import { InjectServices, injectServices } from "../service";

import { CreatePeer } from "../service/peer/createPeer";
import Kademlia from "../../vendor/kademlia";
import { MainNetwork } from "../entity/network/main";
import { NavigatorContainer } from "../usecase/actor/navigator";
import { PeerCreator } from "../module/peerCreator";
import { SeederContainer } from "../usecase/actor/seeder";
import { User } from "../usecase/actor/user";

export type Options = Partial<{ subNetTimeout: number }>;

export class SP2P {
  constructor(
    private modules: { PeerCreator: PeerCreator },
    private existKad: Kademlia,
    private options: Options = { subNetTimeout: 5000 }
  ) {}
  services: InjectServices = {
    ...injectServices(),
    CreatePeer: new CreatePeer({ PeerCreator: this.modules.PeerCreator })
  };
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
