import { SP2P } from "../../../src/adapter/actor";
import { genKad } from "../../../src/entity/network/util";
import { portalNode } from "./portal";

const port = 20000;

const kad = genKad({ timeout: 5000 });
new SP2P(kad);

portalNode(kad, port);
