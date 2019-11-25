import Event from "rx.mini";
import { Peer } from "../../../src/vendor/kademlia";
import { RPC } from "../../../src/vendor/kademlia/modules/peer/base";

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
  SdpType: "offer" | "answer" | undefined = undefined;
  onData = new Event<{ data: RPC; mock: any }>();

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();
  targetContext?: PeerTraffickMock;

  constructor(public kid: string) {
    this.onData.subscribe(({ mock, data }) => {
      if (data.type) {
        if (mock.size) {
          context.traffic += mock.size as any;
        }
        this.onRpc.execute(data);
      }
    });
  }

  rpc = async (data: { type: string; id: string; [key: string]: any }) => {
    await new Promise(r => setTimeout(r));
    if (data.type === "Store" || data.type === "FindValueResult") {
      const mock: any = {};
      // console.log("rpc", data);

      // for kad
      if ((data.value as Buffer).toString() === "value") {
        mock.size = 1;
      }

      // 注意 static storeなので、シーダーは初期Store時に誰にもStoreすることはないので、
      // Spyするさいには、FindValueResultのみを見ればよい

      // layered kad
      if (data.type === "FindValueResult" && data.value?.item) {
        mock.size = 1;
      }
      this.targetContext!.onData.execute({ data, mock });
    } else {
      this.targetContext!.onData.execute({ data, mock: {} });
    }
  };

  parseRPC = (data: ArrayBuffer) => undefined as any;

  eventRpc = (type: string, id: string) => {
    const observer = new Event<any>();
    const { unSubscribe } = this.onData.subscribe(({ data }) => {
      if (data.type === type && data.id === id) {
        observer.execute(data);
        unSubscribe();
      }
    });
    return observer;
  };

  createOffer = async () => {
    this.SdpType = "offer";
    return this as any;
  };

  setOffer = async (sdp: any) => {
    this.SdpType = "answer";
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
