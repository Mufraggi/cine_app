import { Schema } from "effect"
import {
  Genres,
  ImdbId,
  ImdbType,
  OriginalTitle,
  Plot,
  PrimaryImage,
  PrimaryTitle,
  Rating,
  RuntimeSeconds,
  StartYear
} from "./ImdbResponseApiType.js"

export const IMdbData = Schema.Struct({
  id: ImdbId,
  type: ImdbType,
  primaryTitle: PrimaryTitle,
  originalTitle: OriginalTitle,
  primaryImage: PrimaryImage,
  startYear: StartYear,
  runtimeSeconds: Schema.optional(RuntimeSeconds),
  genres: Genres,
  rating: Schema.optional(Rating),
  plot: Plot
})
export type IMdbData = typeof IMdbData.Type

export const EndPointResponseApi = Schema.Struct({
  titles: Schema.Array(IMdbData),
  totalCount: Schema.Number,
  nextPageToken: Schema.String
})
