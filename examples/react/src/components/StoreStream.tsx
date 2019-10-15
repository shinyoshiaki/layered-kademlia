import React, { MutableRefObject, useContext, useRef, useState } from "react";

import Event from "rx.mini";
import { SP2PClientContext } from "../App";
import { VideoCanvas } from "../atoms/VideoCanvas";
import { encode } from "@msgpack/msgpack";
import { libvpxEnc } from "../domain/libvpx";
import useFile from "../hooks/useFile";

const StoreStream: React.FC = () => {
  const [resolution, setResolution] = useState({ x: 400, y: 400 });
  const localRef = useRef<any>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const [url, setUrl] = useState("");
  const sp2pClient = useContext(SP2PClientContext);
  const [_, setfile, onSetfile] = useFile();

  onSetfile(async file => {
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);
    startStreamer(stream);
  });

  const startStreamer = async (stream: MediaStream) => {
    const videoRef = localRef.current;
    if (!videoRef) return;

    const { width, height } = await new Promise<{
      width: number;
      height: number;
    }>(
      r =>
        (videoRef.onloadedmetadata = async (ev: any) => {
          const { videoHeight, videoWidth } = ev.target;
          r({ width: videoWidth, height: videoHeight });
        })
    );

    setResolution({ x: width, y: height });

    const { listener, start, rawListener } = await libvpxEnc(stream, {
      codec: "VP8",
      width,
      height,
      fps: 30,
      bitrate: 10000,
      packetSize: 1
    });

    rawListener.subscribe(ab => {
      const ctx = canvasRef.current.getContext("2d");
      const frame = ctx.createImageData(width, height);
      console.log({ ab });
      frame.data.set(new Uint8Array(ab), 0);
      ctx.putImageData(frame, 0, 0);
    });

    let eventStore: Event<ArrayBuffer>;
    setTimeout(() => start());
    const video = await listener.asPromise();
    const encoded = encode({ video });
    const eventStoreFirst = new Event<Event<ArrayBuffer>>();

    listener.subscribe(async video => {
      const encoded = encode({ video });
      console.log({ encoded });
      if (eventStore) {
        eventStore.execute(encoded);
      } else {
        const event = await eventStoreFirst.asPromise();
        event.execute(encoded);
      }
    });
    const { url, event } = await sp2pClient.actor.seeder.storeStream(
      "test",
      encoded,
      { width, height, cycle: 1 / 30 }
    );
    eventStore = event as any;
    eventStoreFirst.execute(event as any);
    setUrl(url);
  };

  const { x, y } = resolution;

  return (
    <div>
      <input type="file" onChange={setfile} />
      <p>{url}</p>
      <video
        ref={localRef}
        autoPlay={true}
        muted
        style={{ width: 0, height: 0 }}
      />
      <VideoCanvas
        canvasRef={canvasRef}
        style={{ width: 400, height: 400 }}
        source={{ width: x, height: y }}
      />
    </div>
  );
};

export default StoreStream;
