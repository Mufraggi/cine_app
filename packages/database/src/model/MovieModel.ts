import { Model } from "@effect/sql"
import {
  Genres,
  ImdbId,
  OriginalTitle,
  Plot,
  PrimaryImage,
  PrimaryTitle,
  Rating,
  RuntimeSeconds,
  StartYear
} from "@template/domain/imdb/ImdbResponseApiType"
import { MovieId, MovieType } from "@template/domain/movie/MovieType"
import { EmbeddingMovie } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Schema } from "effect"

export class MovieModel extends Model.Class<MovieModel>("MovieModel")({
  id: MovieId,
  imdbId: ImdbId,
  type: MovieType,
  primaryTitle: PrimaryTitle,
  originalTitle: Schema.NullOr(OriginalTitle),
  primaryImage: PrimaryImage,
  startYear: StartYear,
  runtimeSeconds: RuntimeSeconds,
  genres: Genres,
  rating: Rating,
  plot: Plot,
  embedding: EmbeddingMovie,
  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}
