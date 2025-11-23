import { Model } from "@effect/sql"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { EmbeddingMovie, RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Schema } from "effect"

export class RawMovieEmbeddingModel extends Model.Class<RawMovieEmbeddingModel>("RawMovieEmbeddingModel")({
  id: RawMovieEmbeddingId,
  rawMovieApiId: RawMovieApiId,
  embedding: EmbeddingMovie,

  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}
