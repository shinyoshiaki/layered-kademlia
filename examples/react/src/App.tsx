import React, { createContext, useEffect, useRef } from "react";

import PeerList from "./components/PeerList";
import { SP2PClient } from "./services/sp2p";
import SeederList from "./components/SeederList";
import Static from "./components/Static";
import StoreStream from "./components/StoreStream";
import WatchStream from "./components/WatchStream";

export const SP2PClientContext = createContext<SP2PClient>(undefined);

const App: React.FC = () => {
  const sP2PClientRef = useRef(new SP2PClient());

  const sP2PClient = sP2PClientRef.current;

  useEffect(() => {
    sP2PClient.connect("http://localhost:20000");
  }, []);

  return (
    <SP2PClientContext.Provider value={sP2PClientRef.current}>
      <p>sp2p</p>
      <p>{sP2PClient.kad.kid}</p>
      <PeerList />
      <SeederList />
      <StoreStream />
      <WatchStream />
      <Static />
    </SP2PClientContext.Provider>
  );
};

export default App;
