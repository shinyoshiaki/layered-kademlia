import Kademlia from "../../../../src/vendor/kademlia";
import KeyValueStore from "../../../../src/vendor/kademlia/modules/kvs/base";
import { PeerCreator } from "../../../../src/sp2p/module/peerCreator";
import PeerModule from "../../../../src/vendor/kademlia/modules/peer";
import { SP2P } from "../../../../src/sp2p/main";
import axios from "axios";
import genKid from "../../../../src/vendor/kademlia/util/kid";

export class SP2PClient {
  kad = new Kademlia(
    genKid(),
    {
      peerCreate: PeerModule,
      kvs: new KeyValueStore()
    },
    { timeout: 5000 }
  );
  actor = new SP2P({ PeerCreator: new PeerCreator(PeerModule) }, this.kad);

  constructor() {}

  async connect(target: string) {
    const join = await axios.post(target + "/join", {
      kid: this.kad.kid
    });
    const { kid, offer } = join.data;
    const peer = PeerModule(kid);
    const answer = await peer.setOffer(offer);
    axios.post(target + "/answer", {
      kid: this.kad.kid,
      answer
    });
    await peer.onConnect.asPromise();
    this.kad.add(peer);
    await new Promise(r => setTimeout(r));

    await this.kad.findNode(this.kad.kid);
    console.log("connect");
  }
}
