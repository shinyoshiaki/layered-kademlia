import React, { useEffect, useRef, useState } from "react";
import guest, { actor, kad } from "./services/kademlia";

import { SP2P } from "../../../src/adapter/actor";
import { StaticMeta } from "../../../src/entity/data/meta";
import { useAsyncEffect } from "./hooks/useAsyncEffect";
import useInput from "./hooks/useInput";

const App: React.FC = () => {
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [url, inputUrl] = useInput();

  useEffect(() => {
    guest("http://localhost:20000");
    kad.di.eventManager.event.subscribe(console.log);
    console.log(kad);
  }, []);

  const store = async () => {
    const { url } = await actor.seeder.storeStatic(
      "test",
      Buffer.from("hello")
    );
    setKey(url);
  };

  const find = async () => {
    const { subNet, meta } = await actor.user.connectSubNet(url);
    const ab = await subNet.findStaticMetaTarget(meta as StaticMeta);
    console.log({ ab });
    setMsg(Buffer.from(ab).toString());
  };

  return (
    <div>
      <p>sp2p</p>
      <p>{key}</p>
      <button onClick={store}>store</button>
      <input onChange={inputUrl} />
      <button onClick={find}>find </button>
      <p>{msg}</p>
    </div>
  );
};

export default App;
