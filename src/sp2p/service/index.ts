import { CreatePeer } from "./peer/createPeer";
import { NavigatorManager } from "./manager/navigator";
import RpcManager from "../../vendor/kademlia/services/rpcmanager";
import { SeederManager } from "./manager/seeder";
import { SubNetworkManager } from "./manager/submanager";

function dependencyInjection<U extends { [key: string]: any }>(inject: U) {
  const di: { [key in keyof U]: InstanceType<U[key]> } = {} as any;

  Object.keys(inject).forEach(key => {
    (di as any)[key] = new (inject as any)[key]();
  });
  return di;
}

export const createServices = () =>
  dependencyInjection({
    NavigatorManager,
    SeederManager,
    SubNetworkManager,
    CreatePeer,
    RpcManager
  });

export function injectDependency(services: InjectServices) {
  Object.values(services).forEach(service => {
    const injectable = (service as any) as Injectable;
    if (injectable.services) {
      injectable.services = services;
    }
  });
  return services;
}

export type InjectServices = ReturnType<typeof createServices>;

export type Injectable = {
  services: InjectServices;
};
