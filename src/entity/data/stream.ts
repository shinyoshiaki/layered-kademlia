export type ChunkBase = {
  type: "chunk";
  next: "end" | string;
};

export type ChunkNext = ChunkBase & {
  type: "chunk";
  next: string;
};
