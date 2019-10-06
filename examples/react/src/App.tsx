import React, { FC, useState, useRef, useEffect } from "react";
const Worker = require("./test.worker.ts");

const App: FC = () => {
  const workerRef = useRef<Worker>(new Worker());
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const worker = workerRef.current;

    worker.onmessage = e => {
      setMsg(e.data);
    };

    worker.postMessage("call");

    return () => {
      worker.terminate();
    };
  }, []);

  return <div>{msg}</div>;
};

export default App;
