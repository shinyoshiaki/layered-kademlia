import sha1 from "sha1";
import { sliceArraybuffer } from "../../util/arraybuffer";

export const metaChunksSize = 16000;

export type Meta = {
  name: string;
  keys: string[];
};

export function createMeta(
  name: string,
  ab: ArrayBuffer
): { meta: Meta; chunks: ArrayBuffer[] } {
  const chunks = sliceArraybuffer(ab, metaChunksSize);
  return {
    meta: { name, keys: chunks.map(v => sha1(new Buffer(v)).toString()) },
    chunks
  };
}

export function meta2URL(meta: Meta) {
  return sha1(JSON.stringify(meta));
}
