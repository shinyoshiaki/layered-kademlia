import React, { FC, useContext, useRef, useState } from "react";

import { SP2PClientContext } from "../App";
import { StreamMeta } from "../../../../src/entity/data/meta";
import { StreamPlayer } from "../domain/stream/que";
import { VideoCanvas } from "../atoms/VideoCanvas";
import { decode } from "@msgpack/msgpack";
import { libvpxDec } from "../domain/libvpx";
import useInput from "../hooks/useInput";

const WatchStream: FC = () => {
  const [resolution, setResolution] = useState({ x: 400, y: 400 });
  const [url, seturl] = useInput();
  const canvasRef = useRef<any>();
  const sp2pClient = useContext(SP2PClientContext);

  const watch = async () => {
    const res = await sp2pClient.actor.user.connectSubNet(url).catch(() => {});
    if (!res) return;

    const { subNet, meta } = res;
    const { width, height } = (meta as StreamMeta).payload;
    setResolution({ x: width, y: height });
    console.log({ meta });
    const { sender, listener } = await libvpxDec({
      codec: "VP8",
      width,
      height,
      fps: 30,
      bitrate: 10000,
      packetSize: 1
    });

    listener.subscribe(ab => {
      const ctx = canvasRef.current.getContext("2d");
      const frame = ctx.createImageData(width, height);
      frame.data.set(ab, 0);
      ctx.putImageData(frame, 0, 0);
    });

    const streamPlayer = new StreamPlayer();
    streamPlayer.event.subscribe(async v => {
      sender.execute(new Uint8Array(Object.values(v)).buffer);
    });

    subNet.findStreamMetaTarget(
      meta as StreamMeta,
      async ({ type, chunk }) => {
        if (type === "chunk") {
          const { video } = decode(chunk) as {
            video: Uint8Array[];
            audio: Uint8Array[];
          };
          streamPlayer.push(video.map(v => decode(v) as any));
        }
      },
      { preferTimeout: 1000 }
    );
  };

  const { x, y } = resolution;

  return (
    <div>
      <input value={url} onChange={seturl} />
      <button onClick={watch}>watch</button>
      <VideoCanvas
        canvasRef={canvasRef}
        style={{ width: 400, height: 400 }}
        source={{ width: x, height: y }}
      />
    </div>
  );
};

export default WatchStream;
