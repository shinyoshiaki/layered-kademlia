import Event from "rx.mini";
import { Signal } from "webrtc4me";

export type ID = { id: string };

export type RPCBase = { type: string };

export type RPC = {
  type: string;
  [key: string]: string | Buffer | ArrayBuffer;
  id: string;
};

export type Peer = PeerClass & PeerProps;

class PeerClass {
  constructor(public kid: string) {}
}

type PeerProps = {
  type: string;
  SdpType: "offer" | "answer" | undefined;
  onRpc: Event<RPCBase & ID>;
  onDisconnect: Event;
  onConnect: Event;
  parseRPC: (data: ArrayBuffer) => RPC | undefined;
  rpc: (data: RPCBase & ID & { [key: string]: unknown }) => void;
  createOffer: () => Promise<Signal>;
  setOffer: (sdp: Signal) => Promise<Signal>;
  setAnswer: (sdp: Signal) => Promise<Error | undefined>;
  disconnect: () => void;
};

export const PeerMockModule = (kid: string) => new PeerMock(kid);

export class PeerMock implements Peer {
  type = "mock";
  onData = new Event<RPC>();
  SdpType: "offer" | "answer" | undefined = undefined;

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();
  targetContext?: PeerMock;

  constructor(public kid: string) {
    this.onData.subscribe(data => {
      try {
        if (data.type) {
          this.onRpc.execute(data);
        }
      } catch (error) {}
    });
  }

  rpc = async (data: { type: string; id: string }) => {
    await new Promise(r => setTimeout(r));
    this.targetContext!.onData.execute(data);
  };

  parseRPC = (data: ArrayBuffer) => undefined as any;

  createOffer = async () => {
    this.SdpType = "offer";
    return this as any;
  };

  setOffer = async (sdp: any) => {
    this.SdpType = "answer";
    this.targetContext = sdp as PeerMock;
    return this as any;
  };

  setAnswer = async (sdp: any) => {
    const { onConnect } = sdp as PeerMock;
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
