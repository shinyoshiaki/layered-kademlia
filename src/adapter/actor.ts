import Kademlia from "kad-rtc";
import { MainNetwork } from "../entity/network/main";
import { NavigatorContainer } from "../usecase/actor/navigator/container";
import { SeederContainer } from "../usecase/actor/seeder/container";
import { User } from "../usecase/actor/user";
import { injectServices } from "../service";

export class ActorAdapter {
  constructor(private existKad?: Kademlia) {}
  private services = injectServices();
  private mainNet = new MainNetwork(this.existKad);
  user = new User(this.services, this.mainNet);
  navigator = new NavigatorContainer(this.services, this.mainNet);
  seeder = new SeederContainer(this.services, this.mainNet);
}
