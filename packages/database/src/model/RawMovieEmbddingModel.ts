import { Model } from "@effect/sql"
import { RowMovieApiId } from "@template/domain/rowMovieApi/RowMovieApiType"
import { EmbeddingMovie, RowMovieEmbeddingId } from "@template/domain/rowMovieEmbedding/RowMovieEmbeddingType"
import { Schema } from "effect"

export class RawMovieEmbeddingModel extends Model.Class<RawMovieEmbeddingModel>("RawMovieEmbeddingModel")({
  id: RowMovieEmbeddingId,
  rawMovieApiId: RowMovieApiId,
  embedding: EmbeddingMovie,

  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}
