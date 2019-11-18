import Event from "rx.mini";
import { Peer } from "../../../src/vendor/kademlia";
import { RPC } from "../../../src/vendor/kademlia/modules/peer/base";

export const TrafficKeyword = "traffic benchmark";

export const PeerTrafficMockModule = (kid: string) => new PeerTraffickMock(kid);
const context = { traffic: 0 };
export function resetTrafficContext() {
  context.traffic = 0;
}

export function getTrafficContextTraffic() {
  return context.traffic;
}
export class PeerTraffickMock implements Peer {
  type = "mock";
  onData = new Event<RPC>();

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();
  targetContext?: PeerTraffickMock;

  constructor(public kid: string) {
    this.onData.subscribe(data => {
      try {
        if (data.type) {
          if (data.TrafficKeyword === TrafficKeyword) {
            context.traffic += 1;
          }
          this.onRpc.execute(data);
        }
      } catch (error) {}
    });
  }

  rpc = async (data: { type: string; id: string }) => {
    await new Promise(r => setTimeout(r));
    if (data.type === "Store" || data.type === "FindValueResult") {
      (data as any).TrafficKeyword = TrafficKeyword;
    }
    this.targetContext!.onData.execute(data);
  };

  parseRPC = (data: ArrayBuffer) => undefined as any;

  eventRpc = (type: string, id: string) => {
    const observer = new Event<any>();
    const { unSubscribe } = this.onData.subscribe(data => {
      if (data.type === type && data.id === id) {
        observer.execute(data);
        unSubscribe();
      }
    });
    return observer;
  };

  createOffer = async () => this as any;

  setOffer = async (sdp: any) => {
    this.targetContext = sdp as PeerTraffickMock;
    return this as any;
  };

  setAnswer = async (sdp: any) => {
    const { onConnect } = sdp as PeerTraffickMock;
    this.targetContext = sdp;

    await new Promise(r => setTimeout(r, 0));

    onConnect.execute(null);
    this.onConnect.execute(null);

    return undefined;
  };

  disconnect = () => {
    const { onDisconnect, onData } = this.targetContext!;

    onDisconnect.execute(null);
    this.onDisconnect.execute(null);

    onData.allUnsubscribe();
    this.onData.allUnsubscribe();
  };
}
