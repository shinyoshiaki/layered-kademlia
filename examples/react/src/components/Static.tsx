import React, { useContext, useState } from "react";

import { SP2PClientContext } from "../App";
import useInput from "../hooks/useInput";

const Static: React.FC = () => {
  const sP2PClient = useContext(SP2PClientContext);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [text, inputText] = useInput();
  const [key, inputKey] = useInput();

  const onClickStore = async () => {
    const { url } = await sP2PClient.actor.seeder.storeStatic(
      "client",
      Buffer.from(text)
    );
    setUrl(url);
  };

  const onClickFind = async () => {
    const res = await sP2PClient.actor.user.findStatic(
      key,
      sP2PClient.actor.seeder
    );
    setMsg(Buffer.from(res).toString());
  };

  return (
    <div>
      <div>
        <input onChange={inputText} />
        <button onClick={onClickStore}>store</button>
        <p>{url}</p>
      </div>
      <div>
        <input onChange={inputKey} />
        <button onClick={onClickFind}>find</button>
        <p>{msg}</p>
      </div>
    </div>
  );
};

export default Static;
