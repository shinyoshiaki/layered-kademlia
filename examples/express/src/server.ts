import { PeerCreator } from "../../../src/sp2p/module/peerCreator";
import { PeerModule } from "../../../src/vendor/kademlia";
import { SP2P } from "../../../src/sp2p/main";
import { genKad } from "../../../src/sp2p/entity/network/util";
import { portalNode } from "./portal";
import sha1 from "sha1";

const port = 20000;

const kad = genKad(new PeerCreator(PeerModule), sha1("server").toString(), {
  timeout: 5000
});
new SP2P({ PeerCreator: new PeerCreator(PeerModule) }, kad);

portalNode(kad, port);
