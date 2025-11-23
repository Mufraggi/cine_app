import { Model } from "@effect/sql"
import { IMdbData } from "@template/domain/imdb/ImdbResponseApi"
import { RowMovieApiId } from "@template/domain/rowMovieApi/RowMovieApiType"
import { Schema } from "effect"

export class RawMovieApiModel extends Model.Class<RawMovieApiModel>("RawMovieApiModel")({
  id: RowMovieApiId,
  payload: IMdbData,
  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}
