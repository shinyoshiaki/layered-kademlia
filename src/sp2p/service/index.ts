import { CreatePeer } from "./peer/createPeer";
import { NavigatorManager } from "./actor/manager/navigator";
import RpcManager from "../../vendor/kademlia/services/rpcmanager";
import { SeederManager } from "./actor/manager/seeder";
import { SubNetworkManager } from "./network/submanager";

function dependencyInjection<U extends { [key: string]: any }>(inject: U) {
  const di: { [key in keyof U]: InstanceType<U[key]> } = {} as any;

  Object.keys(inject).forEach(key => {
    (di as any)[key] = new (inject as any)[key]();
  });
  return di;
}

export const injectServices = () =>
  dependencyInjection({
    NavigatorManager,
    SeederManager,
    SubNetworkManager,
    CreatePeer,
    RpcManager
  });

export type InjectServices = ReturnType<typeof injectServices>;
