import React, { useEffect, useRef, useState } from "react";

import { SP2P } from "../../../src/adapter/actor";
import { StaticMeta } from "../../../src/entity/data/meta";
import guest from "./services/kademlia";
import { useAsyncEffect } from "./hooks/useAsyncEffect";
import useInput from "./hooks/useInput";

const App: React.FC = () => {
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [url, inputUrl] = useInput();
  const actorRef = useRef<SP2P>();

  useAsyncEffect(async () => {
    const kad = await guest("http://localhost:20000");
    kad.di.eventManager.event.subscribe(console.log);
    actorRef.current = new SP2P(kad);
    console.log({ kad });
  }, []);

  const store = async () => {
    const actor = actorRef.current;
    const { url } = await actor.seeder.storeStatic(
      "test",
      Buffer.from("hello")
    );
    setKey(url);
  };

  const find = async () => {
    const actor = actorRef.current;
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
