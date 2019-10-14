import React, { createContext, useEffect, useRef, useState } from "react";

import PeerList from "./components/PeerList";
import { SP2PClient } from "./services/kademlia";
import { StaticMeta } from "../../../src/entity/data/meta";
import StoreStream from "./components/StoreStream";
import WatchStream from "./components/WatchStream";
import useInput from "./hooks/useInput";

export const SP2PClientContext = createContext<SP2PClient>(undefined);

const App: React.FC = () => {
  const sP2PClientRef = useRef(new SP2PClient());
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [url, inputUrl] = useInput();

  const sP2PClient = sP2PClientRef.current;

  useEffect(() => {
    sP2PClient.connect("http://localhost:20000");
  }, []);

  const store = async () => {
    const { url } = await sP2PClient.actor.seeder.storeStatic(
      "test",
      Buffer.from("hello")
    );
    setKey(url);
  };

  const find = async () => {
    const { subNet, meta } = await sP2PClient.actor.user.connectSubNet(url);
    const ab = await subNet.findStaticMetaTarget(meta as StaticMeta);

    setMsg(Buffer.from(ab).toString());
  };

  return (
    <SP2PClientContext.Provider value={sP2PClientRef.current}>
      <p>sp2p</p>
      <p>{sP2PClient.kad.kid}</p>
      <PeerList />
      <StoreStream />
      <WatchStream />
    </SP2PClientContext.Provider>
  );
};

export default App;
