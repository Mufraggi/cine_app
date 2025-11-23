import { Schema } from "effect"

export const RawMovieEmbeddingId = Schema.UUID.pipe(Schema.brand("RawMovieEmbeddingId"))
export type RawMovieEmbeddingId = typeof RawMovieEmbeddingId.Type

export const EmbeddingMovie = Schema.Array(Schema.Number).pipe(
  Schema.minItems(1536),
  Schema.maxItems(1536)
).pipe(Schema.brand("EmbeddingMovie"))

export type EmbeddingMovie = typeof EmbeddingMovie.Type
