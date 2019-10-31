import sha1 from "sha1";
import { sliceArraybuffer } from "../../../util/arraybuffer";

export const metaChunksSize = 16000;

export type Meta = {
  type: "static" | "stream";
  name: string;
  payload: { [key: string]: any };
};

export type StaticMeta = Meta & {
  type: "static";
  payload: { keys: string[] };
};

export type StreamMetaPayload = {
  first: string;
  width?: number;
  height?: number;
  cycle: number;
};

export type StreamMeta = Meta & {
  type: "stream";
  payload: StreamMetaPayload;
};

export function createStaticMeta(
  name: string,
  ab: ArrayBuffer
): { meta: StaticMeta; chunks: ArrayBuffer[] } {
  const chunks = sliceArraybuffer(ab, metaChunksSize);
  return {
    meta: {
      type: "static",
      name,
      payload: { keys: chunks.map(v => sha1(Buffer.from(v)).toString()) }
    },
    chunks
  };
}

export function createStreamMeta(
  name: string,
  ab: ArrayBuffer,
  payload: Omit<StreamMetaPayload, "first">
): StreamMeta {
  const first = sha1(Buffer.from(ab)).toString();
  return { type: "stream", name, payload: { first, ...payload } };
}

export function meta2URL(meta: Meta) {
  return sha1(JSON.stringify(meta));
}
