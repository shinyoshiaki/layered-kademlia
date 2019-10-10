export type Chunk = {
  type: "chunk";
  next: "end" | string;
};
