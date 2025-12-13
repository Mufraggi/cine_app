import { Model } from "@effect/sql"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { ParseResult, Schema } from "effect"

// Transform to handle PostgreSQL vector type (stored as string "[x,y,z]")
export const VectorSchema = Schema.transformOrFail(
  Schema.String,
  Schema.Array(Schema.Number),
  {
    strict: true,
    decode: (str) => ParseResult.succeed(str.slice(1, -1).split(",").map(Number)),
    encode: (arr) => ParseResult.succeed(`[${arr.join(",")}]`)
  }
)

export class RawMovieEmbeddingModel extends Model.Class<RawMovieEmbeddingModel>("RawMovieEmbeddingModel")({
  id: RawMovieEmbeddingId,
  rawMovieApiId: RawMovieApiId,
  embedding: VectorSchema,

  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}
