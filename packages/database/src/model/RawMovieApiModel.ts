import { Model } from "@effect/sql"
import { IMdbData } from "@template/domain/imdb/ImdbResponseApi"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { Schema } from "effect"

export class RawMovieApiModel extends Model.Class<RawMovieApiModel>("RawMovieApiModel")({
  id: RawMovieApiId,
  payload: IMdbData,
  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}
