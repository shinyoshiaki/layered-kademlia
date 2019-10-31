import { PeerCreater } from "../../../src/sp2p/module/peerCreater";
import { PeerModule } from "../../../src/vendor/kademlia";
import { SP2P } from "../../../src/sp2p/adapter/actor";
import { genKad } from "../../../src/sp2p/entity/network/util";
import { portalNode } from "./portal";
import sha1 from "sha1";

const port = 20000;

const kad = genKad(new PeerCreater(PeerModule), sha1("server").toString(), {
  timeout: 5000
});
new SP2P({ PeerCreater: new PeerCreater(PeerModule) }, kad);

portalNode(kad, port);
