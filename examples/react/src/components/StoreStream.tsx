import React, { useContext, useRef, useState } from "react";

import Event from "rx.mini";
import { SP2PClientContext } from "../App";
import { encode } from "@msgpack/msgpack";
import { libvpxEnc } from "../domain/libvpx";
import useFile from "../hooks/useFile";

const StoreStream: React.FC = () => {
  const framesPerPacket = 2048;
  const localRef = useRef<any>();
  const [url, setUrl] = useState("");
  const sp2pClient = useContext(SP2PClientContext);
  const [_, setfile, onSetfile] = useFile();

  onSetfile(async file => {
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);
    startStreamer(stream);
  });

  const startStreamer = (stream: MediaStream) => {
    const video = localRef.current;

    if (video) {
      let audioChunks: Uint8Array[] = [];

      localRef.current.onloadedmetadata = async (ev: any) => {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(framesPerPacket, 1, 1);
        source.connect(processor);
        const destinationNode = audioCtx.createMediaStreamDestination();
        processor.onaudioprocess = e => {
          const channelData = e.inputBuffer.getChannelData(0);
          audioChunks.push(new Uint8Array(channelData.buffer));
        };
        processor.connect(destinationNode);

        const { videoHeight, videoWidth } = ev.target;
        const { listener } = await libvpxEnc(stream, {
          codec: "VP8",
          width: videoWidth,
          height: videoHeight,
          fps: 30,
          bitrate: 10000,
          packetSize: 1
        });

        let eventStore: Event<ArrayBuffer>;

        const video = await listener.asPromise();
        console.log({ video });
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
          { width: videoWidth, height: videoHeight, cycle: 0 }
        );
        eventStore = event as any;
        eventStoreFirst.execute(event as any);
        setUrl(url);
      };
    }
  };

  return (
    <div>
      <input type="file" onChange={setfile} />
      <p>{url}</p>
      <video ref={localRef} autoPlay={true} muted style={{ width: 300 }} />
    </div>
  );
};

export default StoreStream;
