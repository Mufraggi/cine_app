import { Schema } from "effect"

export const RowMovieEmbeddingId = Schema.UUID.pipe(Schema.brand("RowMovieEmbeddingId"))
export type RowMovieEmbeddingId = typeof RowMovieEmbeddingId.Type

export const EmbeddingMovie = Schema.Array(Schema.Number).pipe(
  Schema.minItems(1536),
  Schema.maxItems(1536)
).pipe(Schema.brand("EmbeddingMovie"))

export type EmbeddingMovie = typeof EmbeddingMovie.Type
